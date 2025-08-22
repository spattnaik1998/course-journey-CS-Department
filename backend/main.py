from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAJORS_DATA = {
    "Applied Machine Learning": [
        {"code": "CS101", "name": "Probability and Statistics"},
        {"code": "CS102", "name": "Data Visualization using R"},
        {"code": "CS103", "name": "Model Building with Regression Algorithms"}
    ],
    "Deep Learning": [
        {"code": "CS201", "name": "Neural Network Basics"},
        {"code": "CS202", "name": "Transformers and Attention"},
        {"code": "CS203", "name": "Generative AI with Python"}
    ],
    "Data Science": [
        {"code": "CS301", "name": "Data Mining"},
        {"code": "CS302", "name": "Hypothesis Testing using t-test"},
        {"code": "CS303", "name": "Feature Engineering with R"}
    ]
}

@app.get("/majors")
def get_majors():
    return [{"id": i, "name": major} for i, major in enumerate(MAJORS_DATA.keys())]

@app.get("/courses/{major_id}")
def get_courses(major_id: int):
    majors = list(MAJORS_DATA.keys())
    if major_id < 0 or major_id >= len(majors):
        raise HTTPException(status_code=404, detail="Major not found")
    
    major_name = majors[major_id]
    return {
        "major": major_name,
        "courses": MAJORS_DATA[major_name]
    }