import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel, Field
from prompts import MATCHING_PROMPT_TEMPLATE
from filter import pre_filter_tutors

# Explicitly specify the path to load the .env file from the parent (root) directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Verify the API key loaded successfully
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError(f"❌ .env file not found. Checked path: {env_path}")

# ==========================================
# 1. Define Pydantic models (Enforce LLM output structure)
# ==========================================
class ScoreBreakdown(BaseModel):
    budget_score: int
    style_score: int
    experience_score: int

class TutorMatch(BaseModel):
    tutor_id: str
    total_score: int
    score_breakdown: ScoreBreakdown
    why_it_works: list[str] = Field(description="Reasons why this tutor is a good match")
    trade_offs: list[str] = Field(description="Potential conflicts, drawbacks, or budget issues")
    student_facing_summary: str = Field(description="A highly polished summary to show to the student")

# ==========================================
# 2. Core matching logic
# ==========================================
def generate_matches(student_dict, tutors_list, max_retries=3):
    """
    Receives student and tutor data, calls the Gemini API to compute matches,
    and returns a structured dictionary. Includes auto-retry for 503 errors.
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    final_prompt = (
        MATCHING_PROMPT_TEMPLATE
        .replace("{student_json_data}", json.dumps(student_dict, ensure_ascii=False))
        .replace("{tutors_json_array}", json.dumps(tutors_list, ensure_ascii=False))
    )
    
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=final_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=list[TutorMatch],  # 👈 Core change: Enforce Pydantic schema
                    temperature=0.2  # Lower temperature for more objective scoring
                )
            )
            return json.loads(response.text)
            
        except APIError as e:
            if "503" in str(e) and attempt < max_retries:
                wait_time = attempt * 2
                print(f"⚠️ Server busy (503). Waiting {wait_time} seconds before attempt {attempt + 1}...")
                time.sleep(wait_time)
            else:
                raise e

# ==========================================
# 3. Local testing module
# ==========================================
if __name__ == "__main__":
    mock_student = {
        "student_id": "S_101",
        "subject": "AP Calculus AB",
        "budget_per_hour": 60,
        "goal": "Score 5 on AP Exam",
        "pain_points": "Struggles with abstract concept intuition, needs slow step-by-step visual explanations"
    }

    mock_tutors = [
        {
            "tutor_id": "T_001",
            "name": "Alex",
            "subject": "AP Calculus AB",
            "hourly_rate": 55,
            "teaching_style": "Patient and visual, focuses on intuitive step-by-step concept building",
            "experience": "4 years AP Calculus tutoring, 90% student AP score 5 rate"
        },
        {
            "tutor_id": "T_002",
            "name": "Brian",
            "subject": "AP Calculus AB",
            "hourly_rate": 70,
            "teaching_style": "Fast-paced, aggressive test hacking and shortcut tricks",
            "experience": "2 years high school math tutoring"
        },
        {
            "tutor_id": "T_003",
            "name": "Chloe",
            "subject": "AP English Language",
            "hourly_rate": 50,
            "teaching_style": "Essay structuring and critical reading analysis",
            "experience": "3 years English tutoring"
        },
        {
            "tutor_id": "T_004",
            "name": "David",
            "subject": "AP Calculus AB",
            "hourly_rate": 150,
            "teaching_style": "Elite college professor level, extremely rigorous",
            "experience": "15 years university teaching"
        }
    ]

    print("⏳ Running pre-filter logic...")
    candidates = pre_filter_tutors(mock_student, mock_tutors, max_candidates=5)
    
    print(f"✅ Filtered down to {len(candidates)} candidates. Sending to Gemini...")
    try:
        match_results = generate_matches(mock_student, candidates)
        print("✅ Matching successful! Explainable JSON result:\n")
        print(json.dumps(match_results, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"❌ Error running matching engine: {e}")