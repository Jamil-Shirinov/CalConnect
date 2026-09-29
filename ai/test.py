from google import genai
client = genai.Client()
response = client.models.generate_content(model="gemini-3.5-flash-lite", contents="Write a short welcome message.")
print(response.text)