from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI


app = FastAPI()
MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
API_KEY = "dummy"

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app's URL
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

# generate function to create the responses from the model
async def generate(client, input):
    completion = client.chat.completions.create(
        model=MODEL,
        messages=input,
        stream=True  # Enable streaming
    )

    async for chunk in completion:
        yield chunk.choices[0].delta.get("content", "")

# Initialize the client once when the module is imported
client = createClient(API_KEY)

@app.post("/chat")
async def chat(message: ChatMessage):
    input = message.message['messages']
    async def event_generator():
        async for chunk in generate(client, input):
            if "</think>" in chunk:
                # Start streaming after </think> tag
                yield chunk.split("</think>")[1]
            elif chunk:
                yield chunk

    return EventSourceResponse(event_generator())

print("hello")
# # generate function to create the responses from the model
# def generate(client, input):
#     completion = client.chat.completions.create(
#         model= MODEL,
#         messages = input )
#     return(completion.choices[0].message)

# # Initialize the client once when the module is imported
# client = createClient(API_KEY)

# @app.post("/chat")
# async def chat(message: ChatMessage):
#     # Simulate a response
#     input = message.message['messages']
#     AI_response = generate(client, input).content.split("</think>")
#     AI_think = AI_response[0]
#     AI_answer = AI_response[1]
#     print(AI_think)
#     return {"response": AI_answer}


# @app.post("/funfact")
# async def funfact():
#     # Simulate a response
#     input = [{"role": "system", "content": "Tell me a fun fact about Programming and Computer Science"}]
#     AI_response = generate(client, input).content.split("</think>")
#     AI_think = AI_response[0]
#     AI_answer = AI_response[1]
#     return {"response": AI_answer}
