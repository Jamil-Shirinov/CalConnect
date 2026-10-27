import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# run Gemini 3.8
response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="Hello! Confirm you are working for CalConnect project.",
)

print(response.text)