
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
import asyncio
import threading


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
    loop = asyncio.get_running_loop()
    queue = asyncio.Queue()

    def worker():
        try:
            # Note: Remove the await here because the method is synchronous
            completion = client.chat.completions.create(
                model=MODEL,
                messages=input,
                stream=True
            )
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content is not None:
                    # Schedule putting the token into the queue in a thread-safe way
                    asyncio.run_coroutine_threadsafe(queue.put(content), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put(f"Error: {str(e)}"), loop)
        finally:
            # Signal the end of streaming by putting a sentinel value
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    # Run the synchronous worker in a separate thread
    threading.Thread(target=worker, daemon=True).start()

    try:
        # Asynchronously yield tokens from the queue as they arrive
        while True:
            token = await queue.get()
            if token is None:  # End-of-stream sentinel
                break
            yield token
    except asyncio.CancelledError:
        print("Connection was closed by the client")
        raise

client = createClient(API_KEY)

@app.post("/chat")
async def chat(request: Request, message: ChatMessage):
    input = message.message['messages']
    
    generator = generate(client, input)
    
    return EventSourceResponse(
        generator,
        media_type="text/event-stream",
        ping=20000  # Send a ping every 20 seconds to keep the connection alive
    )
