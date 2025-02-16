from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
import asyncio
import threading

app = FastAPI()
MODEL_THINK = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
MODEL_NOTHINK = "Qwen/Qwen2.5-Coder-7B-Instruct"
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
            completion = client.chat.completions.create(
                model=MODEL_NOTHINK,
                messages=input,
                stream=True
            )
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content is not None:
                    asyncio.run_coroutine_threadsafe(queue.put(content), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put(f"Error: {str(e)}"), loop)
        finally:
            # Signal the end of the stream
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    # Start the worker thread
    threading.Thread(target=worker, daemon=True).start()

    buffer = ""
    streaming_started = False

    try:
        while True:
            token = await queue.get()
            if token is None:  # End-of-stream
                break
            
            yield token
            ## Uncomment the following block to enable streaming with think markers
            # if not streaming_started:
            #     buffer += token
            #     if '</think>' in buffer:
            #         # Find the position right after the marker.
            #         marker_end = buffer.index('</think>') + len('</think>')
            #         # Start streaming: yield the text after the marker (if any)
            #         remainder = buffer[marker_end:]
            #         if remainder:
            #             yield remainder
            #         streaming_started = True
            # else:
            #     yield token

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
