from dotenv import load_dotenv
from google import genai

import json, time, random

with open("data.json", "r", encoding="utf-8") as file:
    data = json.load(file)

load_dotenv()

client = genai.Client() # will pick up GEMINI_API_KEY from .env
for i in range(20):
    response = client.models.generate_content(model="gemini-3.5-flash-lite", 
                                            contents=("Using the following data, provide a score out of 10",
                                                        "based on how well these two students match.",
                                                        "Number only.", json.dumps(data)))
    print(response.text)
    time.sleep(random.randint(5, 50))