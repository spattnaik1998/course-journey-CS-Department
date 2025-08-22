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
        {"code": "CS101", "name": "Probability and Statistics", "description": "Introduction to probability theory and statistical methods for data analysis", "credits": 3, "semester": "Fall", "faculty": {"name": "Dr. Sarah Johnson", "email": "s.johnson@university.edu", "office_hours": "Monday & Wednesday 2-4 PM"}},
        {"code": "CS102", "name": "Data Visualization using R", "description": "Learn to create compelling visualizations using R programming language", "credits": 3, "semester": "Spring", "faculty": {"name": "Prof. Michael Chen", "email": "m.chen@university.edu", "office_hours": "Tuesday & Thursday 10-12 PM"}},
        {"code": "CS103", "name": "Model Building with Regression Algorithms", "description": "Advanced techniques for building predictive models using various regression methods", "credits": 4, "semester": "Fall", "faculty": {"name": "Dr. Emily Rodriguez", "email": "e.rodriguez@university.edu", "office_hours": "Friday 1-4 PM"}}
    ],
    "Deep Learning": [
        {"code": "CS201", "name": "Neural Network Basics", "description": "Fundamentals of neural networks including perceptrons, backpropagation, and optimization", "credits": 4, "semester": "Fall", "faculty": {"name": "Prof. David Kim", "email": "d.kim@university.edu", "office_hours": "Monday & Friday 9-11 AM"}},
        {"code": "CS202", "name": "Transformers and Attention", "description": "Modern transformer architectures and attention mechanisms for NLP and computer vision", "credits": 4, "semester": "Spring", "faculty": {"name": "Dr. Lisa Wang", "email": "l.wang@university.edu", "office_hours": "Wednesday 2-5 PM"}},
        {"code": "CS203", "name": "Generative AI with Python", "description": "Hands-on experience with generative models including GANs, VAEs, and large language models", "credits": 3, "semester": "Summer", "faculty": {"name": "Prof. Alex Thompson", "email": "a.thompson@university.edu", "office_hours": "Tuesday & Thursday 1-3 PM"}}
    ],
    "Data Science": [
        {"code": "CS301", "name": "Data Mining", "description": "Techniques for discovering patterns in large datasets using clustering, classification, and association rules", "credits": 3, "semester": "Fall", "faculty": {"name": "Dr. Rachel Green", "email": "r.green@university.edu", "office_hours": "Monday & Wednesday 11 AM-1 PM"}},
        {"code": "CS302", "name": "Hypothesis Testing using t-test", "description": "Statistical hypothesis testing methods with focus on t-tests and their applications", "credits": 2, "semester": "Spring", "faculty": {"name": "Prof. James Miller", "email": "j.miller@university.edu", "office_hours": "Thursday 3-6 PM"}},
        {"code": "CS303", "name": "Feature Engineering with R", "description": "Advanced feature selection and engineering techniques using R for machine learning projects", "credits": 3, "semester": "Fall", "faculty": {"name": "Dr. Maria Garcia", "email": "m.garcia@university.edu", "office_hours": "Tuesday & Friday 10 AM-12 PM"}}
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