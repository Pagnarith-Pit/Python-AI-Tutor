
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI


app = FastAPI()
MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
API_KEY = "dummy"

# Configure CORS with specific headers needed for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: dict

def createClient(api_key):
    client = OpenAI(
        base_url="http://172.26.150.236:443/v1",
        api_key=api_key,
    )
    return client

async def generate(client, input):
    completion = client.chat.completions.create(
        model=MODEL,
        messages=input,
        stream=True
    )

    async for chunk in completion:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content

client = createClient(API_KEY)

@app.post("/chat")
async def chat(message: ChatMessage):
    input = message.message['messages']
    
    return EventSourceResponse(
        generate(client, input),
        media_type="text/event-stream"
    )
