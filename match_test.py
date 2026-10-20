from google import genai
from pydantic import BaseModel, Field

class MatchResult(BaseModel):
    match_score: float = Field(description="Compatibility from 0 to 1")
    reason: str = Field(description="One sentence explainign the score")
student = {"courses": ["MATH 1A", "DATA 8"], "learning_method": ["visual"], "interests": ["cooking"], "class_year": "sophomore"}
tutor = {"courses": ["DATA 8", "CS 61A"], "learning_method": ["visual", "practice_problems"], "interests": ["cooking", "gaming"], "class_year": "senior"}

client = genai.Client()
interaction = client.interactions.create(
    model="gemini-3.8-flash",
    input=f"Rate how well this tutor matches this student. \nStudent: {student}\nTutor: {tutor}",
    response_format={"type": "text", "mime_type": "application/json",
                     "schema": MatchResult.model_json_schema()}, 
)
result = MatchResult.model_validate_json(interaction.output_text)
print(result.match_score, result.reason)