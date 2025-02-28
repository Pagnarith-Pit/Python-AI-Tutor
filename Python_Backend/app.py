from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
import asyncio
import threading
import os
from dotenv import load_dotenv
load_dotenv('/Users/ppit/Desktop/python-pathway-project/.env.local')

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

class checkResponse(BaseModel):
    message: dict
    correct_answer: str

def createClient(api_key):
    client = OpenAI(
        base_url = os.environ.get("INSTANCE_HOST"),
        api_key=api_key,
    )

    return client

client = createClient(API_KEY)

# Creating Solution from Thinking Model
async def generate_solution(client, message: ChatMessage):
    # Processing Message4
    input_concept = message.message['messages']['concept']
    input_problemDesc = message.message['messages']['problemDesc']

    # Creating the input
    # Here is where we can add the concept and problem description 
    # SYSTEM_PROMPT = "Create a solution for the following problem statement, 
    # Fcous on these concepts, Follow this format [{Step 1: }, {Step 2: } "

    input = [{"role": "user", "content": "Here are your requirements. You are to come up with step by step solution to the following problem statement: " + input_problemDesc + " and focus on the following concepts: " + input_concept}]

    # Getting the response
    completion = client.chat.completions.create(
        model= MODEL_NOTHINK,
        messages = input )
    return(completion.choices[0].message)

@app.post("/createSolution")
async def create_Solution(message: ChatMessage):
    # AI_response = await generate_solution(client, message)
    ## Uncomment to switch to the thinking model
    # AI_response = AI_response.content.split("</think>")
    # AI_think = AI_response[0]
    # AI_answer = AI_response[1]
    
    ## ONLY A TEST
    # AI_answer = AI_response.content
    # AI_think = "This is the thinking model"

    ## DUMMY TEST
    AI_think = """This is a model think dummy"""
    AI_answer = {"Step 1": "First step", "Step 2": "Second step", "Step 3": "Third step"}
    
    return {"model_reasoning": AI_think, "response": AI_answer}

# Creating Solution from Thinking Model
@app.post("/checkResponse")
async def check_response(request: checkResponse):
    message = request.message
    correct_answer = request.correct_answer
    
    input = "Add prompt for AI to consider whether student is right or wrong. If wrong, generate why student is wrong and strategy to use. If right, generate CORRECT and reflection, and strategy is 'START'"
    input = "Analyse the student's previous conversation. Is their last respond answering the question correctly? Refer to the correct answer argument for the correct answer."

    ## Format the solution to {student_mistake: text, strategy: text}
    # AI_response = await generate_solution(client, input)
    # AI_response = AI_response.content.split("</think>")
    # # AI_think = AI_response[0]
    # AI_answer = AI_response[1]


    # Extract the student mistake and strategy 
    # ------------------------------
    student_mistake = "CORRECT"
    strategy = "What strategy to use"
    # ------------------------------

    if student_mistake == "CORRECT":
        strategy = "START"

    return [student_mistake, strategy]

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


## Arguments for message: messages, correct_answer, student_mistake, strategy
@app.post("/chat")
async def chat(request: Request, message: ChatMessage):
    ## Prompt the AI to create the question with those inputs

        
    PROMPT = "Create a question based on the following information: " + message.correct_answer + " and focus on the following concepts: " + message.strategy + " and the student's mistake is: " + message.student_mistake
    message = message.message['messages']

    ## Must work on the prompt to make it more specific
    ## ------------------------------------------------
    # input = [{"role": "user", "content": PROMPT + " " + message}]
    input = message
    ## ------------------------------------------------

    generator = generate_chat(client, input, request)

    return EventSourceResponse(
        generator,
        media_type="text/event-stream",
        ping=20000  # Send a ping every 20 seconds to keep the connection alive
    )
