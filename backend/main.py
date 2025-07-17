from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BioRequest(BaseModel):
    aboutInput: str

@app.post("/generate-bio")
async def generate_bio(req: BioRequest):
    # Dummy implementation for now
    about = req.aboutInput.strip()
    if not about:
        return {"bio": "Please provide some information about yourself."}
    # In production, call an AI model or use more advanced logic
    return {"bio": f"This artist is known for: {about}."} 