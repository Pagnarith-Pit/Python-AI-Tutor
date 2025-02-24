from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
import asyncio
import threading
import os
from dotenv import load_dotenv

app = FastAPI()
MODEL_THINK = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
MODEL_NOTHINK = "Qwen/Qwen2.5-Coder-7B-Instruct"
API_KEY = "dummy"
load_dotenv('/Users/ppit/Desktop/chatty-dots-ui/.env.local')

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
        base_url = os.environ.get("INSTANCE_HOST"),
        api_key=api_key,
    )

    return client

client = createClient(API_KEY)

# Creating Solution from Thinking Model
async def generate_solution(message: ChatMessage):
    # Processing Message4
    input_concept = message.message['messages']['concept']
    input_problemDesc = message.message['messages']['problemDesc']

    # Creating the input
    # Here is where we can add the concept and problem description 
    # SYSTEM_PROMPT = "Create a solution for the following problem statement, 
    # Fcous on these concepts, Follow this format [{Step 1: }, {Step 2: } "

    # Getting the response
    completion = await client.chat.completions.create(
        model= MODEL_THINK,
        messages = input )
    return(completion.choices[0].message)

# Creating Chat from NoThinking Model - Streaming
async def generate_chat(client, input, request: Request):
    loop = asyncio.get_running_loop()
    queue = asyncio.Queue()
    is_disconnected = False

    def worker():
        try:
            completion = client.chat.completions.create(
                model=MODEL_NOTHINK,
                messages=input,
                stream=True
            )
            for chunk in completion:
                if is_disconnected:
                    break
                content = chunk.choices[0].delta.content
                if content is not None:
                    asyncio.run_coroutine_threadsafe(queue.put(content), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put(f"Error: {str(e)}"), loop)
        finally:
            # Signal the end of the stream
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    # Start the worker thread
    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    try:
        while True:
            # Check if client disconnected using the state connection
            if await request.is_disconnected():
                is_disconnected = True
                break

            token = await queue.get()
            if token is None:  # End-of-stream
                break
            
            yield token

    except asyncio.CancelledError:
        print("Stream was cancelled by the client")
        is_disconnected = True
        raise
    finally:
        if thread.is_alive():
            # The thread will eventually terminate since it's a daemon thread
            print("Cleaning up worker thread")

@app.post("/createSolution")
async def create_Solution(request: Request, message: ChatMessage):
    # AI_response = generate_solution(client, message).content.split("</think>")
    ## Dummy
    AI_response = f"""<think>
                    - Key concept: {message.message['messages']['concept']}
                    - Problem statement: {message.message['messages']['problemDesc']}
                    </think>
                    Here's a solution to your problem:
                    """
    
    AI_response = AI_response.split("</think>")
    AI_think = AI_response[0]
    AI_answer = AI_response[1]
    
    return {"model_reasoning": AI_think, "response": AI_answer}

@app.post("/chat")
async def chat(request: Request, message: ChatMessage):
    input = message.message['messages']
    generator = generate_chat(client, input, request)

    return EventSourceResponse(
        generator,
        media_type="text/event-stream",
        ping=20000  # Send a ping every 20 seconds to keep the connection alive
    )
