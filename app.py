
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
import asyncio


app = FastAPI()
MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
API_KEY = "dummy"

# Configure CORS with specific headers needed for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=input,
            stream=True
        )

        async for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except asyncio.CancelledError:
        # Handle the cancellation gracefully
        print("Connection was closed by the client")
        raise
    except Exception as e:
        print(f"Error in generate: {str(e)}")
        yield f"Error: {str(e)}"

client = createClient(API_KEY)

@app.post("/chat")
async def chat(request: Request, message: ChatMessage):
    input = message.message['messages']
    
    return EventSourceResponse(
        generator,
        media_type="text/event-stream",
        ping=20000  # Send a ping every 20 seconds to keep the connection alive
    )
