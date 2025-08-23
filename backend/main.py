from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI()

# In-memory view counter for analytics
view_counts = {}

# Request model for chatbot
class ChatRequest(BaseModel):
    question: str

# CORS configuration for production and development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://localhost:3000", # Local development with HTTPS
    FRONTEND_URL,  # Production frontend URL
]

# Add Railway.app domains to allowed origins
if os.getenv("RAILWAY_ENVIRONMENT"):
    allowed_origins.extend([
        "https://*.railway.app",
        "https://*.up.railway.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

# Faculty data for each department
FACULTY_DATA = {
    "Applied Machine Learning": [
        {
            "name": "Dr. Sarah Johnson",
            "courses": ["CS101: Probability and Statistics"],
            "educational_background": "PhD in Statistics, Stanford University; MS in Mathematics, MIT",
            "email": "s.johnson@university.edu",
            "office_hours": "Monday & Wednesday 2-4 PM"
        },
        {
            "name": "Prof. Michael Chen",
            "courses": ["CS102: Data Visualization using R"],
            "educational_background": "PhD in Computer Science, UC Berkeley; BS in Statistics, UCLA",
            "email": "m.chen@university.edu",
            "office_hours": "Tuesday & Thursday 10-12 PM"
        },
        {
            "name": "Dr. Emily Rodriguez",
            "courses": ["CS103: Model Building with Regression Algorithms"],
            "educational_background": "PhD in Machine Learning, Carnegie Mellon University; MS in Applied Mathematics, Caltech",
            "email": "e.rodriguez@university.edu",
            "office_hours": "Friday 1-4 PM"
        }
    ],
    "Deep Learning": [
        {
            "name": "Prof. David Kim",
            "courses": ["CS201: Neural Network Basics"],
            "educational_background": "PhD in Artificial Intelligence, MIT; MS in Computer Science, Stanford",
            "email": "d.kim@university.edu",
            "office_hours": "Monday & Friday 9-11 AM"
        },
        {
            "name": "Dr. Lisa Wang",
            "courses": ["CS202: Transformers and Attention"],
            "educational_background": "PhD in Natural Language Processing, Google Research; MS in Computer Science, University of Washington",
            "email": "l.wang@university.edu",
            "office_hours": "Wednesday 2-5 PM"
        },
        {
            "name": "Prof. Alex Thompson",
            "courses": ["CS203: Generative AI with Python"],
            "educational_background": "PhD in Machine Learning, Oxford University; BS in Computer Science, Harvard",
            "email": "a.thompson@university.edu",
            "office_hours": "Tuesday & Thursday 1-3 PM"
        }
    ],
    "Data Science": [
        {
            "name": "Dr. Rachel Green",
            "courses": ["CS301: Data Mining"],
            "educational_background": "PhD in Data Science, University of Chicago; MS in Statistics, Northwestern University",
            "email": "r.green@university.edu",
            "office_hours": "Monday & Wednesday 11 AM-1 PM"
        },
        {
            "name": "Prof. James Miller",
            "courses": ["CS302: Hypothesis Testing using t-test"],
            "educational_background": "PhD in Biostatistics, Johns Hopkins University; MS in Applied Statistics, Columbia University",
            "email": "j.miller@university.edu",
            "office_hours": "Thursday 3-6 PM"
        },
        {
            "name": "Dr. Maria Garcia",
            "courses": ["CS303: Feature Engineering with R"],
            "educational_background": "PhD in Statistical Computing, University of Texas at Austin; BS in Mathematics, Rice University",
            "email": "m.garcia@university.edu",
            "office_hours": "Tuesday & Friday 10 AM-12 PM"
        }
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

@app.get("/faculty/{major_id}")
def get_faculty(major_id: int):
    majors = list(FACULTY_DATA.keys())
    if major_id < 0 or major_id >= len(majors):
        raise HTTPException(status_code=404, detail="Major not found")
    
    major_name = majors[major_id]
    return {
        "major": major_name,
        "faculty": FACULTY_DATA[major_name]
    }

@app.post("/courses/{course_code}/view")
def track_course_view(course_code: str):
    if course_code not in view_counts:
        view_counts[course_code] = 0
    view_counts[course_code] += 1
    return {"success": True, "views": view_counts[course_code]}

@app.get("/analytics")
def get_analytics():
    # Get all course codes and their view counts
    all_courses = []
    for major_courses in MAJORS_DATA.values():
        for course in major_courses:
            course_data = {
                "code": course["code"],
                "name": course["name"],
                "views": view_counts.get(course["code"], 0)
            }
            all_courses.append(course_data)
    
    return {"courses": all_courses}

@app.post("/assistant")
def chatbot_assistant(request: ChatRequest):
    question = request.question.lower()
    keywords = question.split()
    
    matching_courses = []
    
    # Search through all courses
    for major, courses in MAJORS_DATA.items():
        for course in courses:
            # Search in course name, description, and faculty name
            searchable_text = f"{course['name']} {course['description']} {course['faculty']['name']}".lower()
            
            # Check if any keyword matches
            if any(keyword in searchable_text for keyword in keywords):
                course_info = {
                    "major": major,
                    "code": course["code"],
                    "name": course["name"],
                    "description": course["description"],
                    "credits": course["credits"],
                    "semester": course["semester"],
                    "faculty": course["faculty"]["name"]
                }
                matching_courses.append(course_info)
    
    # Generate response
    if not matching_courses:
        response = "I couldn't find any courses matching your question. Try asking about specific topics like 'statistics', 'python', 'data', or 'neural networks'."
    elif len(matching_courses) == 1:
        course = matching_courses[0]
        response = f"I found one course that matches: **{course['code']}: {course['name']}** in {course['major']}. {course['description']} It's {course['credits']} credits, offered in {course['semester']}, and taught by {course['faculty']}."
    else:
        response = f"I found {len(matching_courses)} courses that match your question:\n\n"
        for course in matching_courses[:3]:  # Limit to top 3 results
            response += f"• **{course['code']}: {course['name']}** ({course['major']}) - {course['credits']} credits, {course['semester']}\n"
        if len(matching_courses) > 3:
            response += f"\n...and {len(matching_courses) - 3} more courses."
    
    return {
        "response": response,
        "matching_courses": matching_courses
    }