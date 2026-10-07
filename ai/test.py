from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client() # will pick up GEMINI_API_KEY from .env
response = client.models.generate_content(model="gemini-3.5-flash-lite", contents="Write a short welcome message.")
print(response.text)