from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
import numpy as np
import json
import uuid
import re
from typing import List, Dict, Any
from openai import OpenAI

app = FastAPI()


# In-memory storage for course embeddings
course_embeddings = {}

# In-memory storage for selected courses
selected_courses = []

# Request model for chatbot
class ChatRequest(BaseModel):
    question: str

# Request model for course summarization
class SummarizeRequest(BaseModel):
    course_description: str

# Request model for course selection
class CourseSelectionRequest(BaseModel):
    course_code: str

# Authentication models
class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CourseRegistrationRequest(BaseModel):
    uid: str
    courses: List[Dict[str, Any]]

# CORS configuration for production and development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Allow all localhost ports for development
localhost_ports = [f"http://localhost:{port}" for port in range(3000, 3010)]
https_localhost_ports = [f"https://localhost:{port}" for port in range(3000, 3010)]

allowed_origins = [
    *localhost_ports,         # All localhost ports 3000-3009
    *https_localhost_ports,   # All localhost HTTPS ports 3000-3009
    FRONTEND_URL,            # Production frontend URL
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

# Configure OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Functions for course recommendation system
def get_embedding(text: str):
    """Generate embedding for a given text using OpenAI's embedding model"""
    try:
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0
    
    return dot_product / (norm_vec1 * norm_vec2)

def get_course_limit():
    """Get the maximum course limit for a student"""
    return 3

# User management utilities
USERS_FILE = "users.json"

def load_users() -> List[Dict[str, Any]]:
    """Load users from JSON file"""
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_users(users: List[Dict[str, Any]]):
    """Save users to JSON file"""
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def validate_email(email: str) -> bool:
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def find_user_by_email(email: str) -> Dict[str, Any] or None:
    """Find user by email"""
    users = load_users()
    for user in users:
        if user["email"] == email:
            return user
    return None

def find_user_by_uid(uid: str) -> Dict[str, Any] or None:
    """Find user by UID"""
    users = load_users()
    for user in users:
        if user["uid"] == uid:
            return user
    return None

def update_user_registrations(uid: str, registered_courses: List[Dict[str, Any]]) -> bool:
    """Update user's registered courses"""
    users = load_users()
    for user in users:
        if user["uid"] == uid:
            user["registered_courses"] = registered_courses
            save_users(users)
            return True
    return False

def get_user_registrations(uid: str) -> List[Dict[str, Any]]:
    """Get user's registered courses"""
    user = find_user_by_uid(uid)
    if user and "registered_courses" in user:
        return user["registered_courses"]
    return []

def precompute_course_embeddings():
    """Precompute embeddings for all course descriptions"""
    print("Precomputing course embeddings...")
    for major, courses in MAJORS_DATA.items():
        for course in courses:
            course_code = course["code"]
            # Combine course name and description for richer embeddings
            text_to_embed = f"{course['name']} - {course['description']}"
            embedding = get_embedding(text_to_embed)
            if embedding:
                course_embeddings[course_code] = {
                    "embedding": embedding,
                    "course_info": {
                        "code": course_code,
                        "name": course["name"],
                        "description": course["description"],
                        "major": major,
                        "credits": course["credits"],
                        "faculty": course["faculty"]["name"]
                    }
                }
    print(f"Precomputed embeddings for {len(course_embeddings)} courses")

MAJORS_DATA = {
    "Applied Machine Learning": [
        {"code": "CS101", "name": "Probability and Statistics", "description": "Introduction to probability theory and statistical methods for data analysis", "credits": 3, "faculty": {"name": "Dr. Sarah Johnson", "email": "s.johnson@university.edu", "office_hours": "Monday & Wednesday 2-4 PM"}},
        {"code": "CS102", "name": "Data Visualization using R", "description": "Learn to create compelling visualizations using R programming language", "credits": 3, "faculty": {"name": "Prof. Michael Chen", "email": "m.chen@university.edu", "office_hours": "Tuesday & Thursday 10-12 PM"}},
        {"code": "CS103", "name": "Model Building with Regression Algorithms", "description": "Advanced techniques for building predictive models using various regression methods", "credits": 4, "faculty": {"name": "Dr. Emily Rodriguez", "email": "e.rodriguez@university.edu", "office_hours": "Friday 1-4 PM"}}
    ],
    "Deep Learning": [
        {"code": "CS201", "name": "Neural Network Basics", "description": "Fundamentals of neural networks including perceptrons, backpropagation, and optimization", "credits": 4, "faculty": {"name": "Prof. David Kim", "email": "d.kim@university.edu", "office_hours": "Monday & Friday 9-11 AM"}},
        {"code": "CS202", "name": "Transformers and Attention", "description": "Modern transformer architectures and attention mechanisms for NLP and computer vision", "credits": 4, "faculty": {"name": "Dr. Lisa Wang", "email": "l.wang@university.edu", "office_hours": "Wednesday 2-5 PM"}},
        {"code": "CS203", "name": "Generative AI with Python", "description": "Hands-on experience with generative models including GANs, VAEs, and large language models", "credits": 3, "faculty": {"name": "Prof. Alex Thompson", "email": "a.thompson@university.edu", "office_hours": "Tuesday & Thursday 1-3 PM"}}
    ],
    "Data Science": [
        {"code": "CS301", "name": "Data Mining", "description": "Techniques for discovering patterns in large datasets using clustering, classification, and association rules", "credits": 3, "faculty": {"name": "Dr. Rachel Green", "email": "r.green@university.edu", "office_hours": "Monday & Wednesday 11 AM-1 PM"}},
        {"code": "CS302", "name": "Hypothesis Testing using t-test", "description": "Statistical hypothesis testing methods with focus on t-tests and their applications", "credits": 2, "faculty": {"name": "Prof. James Miller", "email": "j.miller@university.edu", "office_hours": "Thursday 3-6 PM"}},
        {"code": "CS303", "name": "Feature Engineering with R", "description": "Advanced feature selection and engineering techniques using R for machine learning projects", "credits": 3, "faculty": {"name": "Dr. Maria Garcia", "email": "m.garcia@university.edu", "office_hours": "Tuesday & Friday 10 AM-12 PM"}}
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

# Precompute embeddings when the server starts
@app.on_event("startup")
async def startup_event():
    if client.api_key:  # Only precompute if OpenAI API key is available
        precompute_course_embeddings()

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



@app.post("/assistant")
def chatbot_assistant(request: ChatRequest):
    try:
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Prepare course database context for the AI
        courses_context = ""
        for major, courses in MAJORS_DATA.items():
            courses_context += f"\n**{major} Department:**\n"
            for course in courses:
                courses_context += f"- {course['code']}: {course['name']} ({course['credits']} credits)\n"
                courses_context += f"  Description: {course['description']}\n"
                courses_context += f"  Faculty: {course['faculty']['name']} ({course['faculty']['email']})\n"
                courses_context += f"  Office Hours: {course['faculty']['office_hours']}\n\n"
        
        # Enhanced system prompt with course database
        system_prompt = f"""You are an intelligent course advisor for a Computer Science Department. You help students find courses, understand requirements, and plan their academic journey.

Available Courses Database:
{courses_context}

Instructions:
- Answer questions about courses, faculty, prerequisites, and academic planning
- Be helpful, friendly, and informative
- When recommending courses, mention course codes, names, credits, and faculty
- If asked about specific topics, suggest relevant courses from the database
- For general questions, provide helpful academic guidance
- Use markdown formatting for better readability (** for bold)
- Keep responses concise but comprehensive
- If you cannot find specific information in the course database, provide general academic advice"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": request.question
                }
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Find relevant courses mentioned in the AI response for frontend highlighting
        matching_courses = []
        for major, courses in MAJORS_DATA.items():
            for course in courses:
                if (course['code'].lower() in ai_response.lower() or 
                    course['name'].lower() in ai_response.lower()):
                    course_info = {
                        "major": major,
                        "code": course["code"],
                        "name": course["name"],
                        "description": course["description"],
                        "credits": course["credits"],
                        "faculty": course["faculty"]["name"]
                    }
                    matching_courses.append(course_info)
        
        return {
            "response": ai_response,
            "matching_courses": matching_courses
        }
        
    except Exception as e:
        # Fallback to original text matching if OpenAI fails
        return fallback_text_search(request.question)

def fallback_text_search(question: str):
    """Fallback function using original text matching if OpenAI fails"""
    question_lower = question.lower()
    keywords = question_lower.split()
    
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

@app.get("/recommend/{course_id}")
def get_course_recommendations(course_id: str):
    """Get course recommendations based on similarity to the given course"""
    try:
        # Check if the course exists
        if course_id not in course_embeddings:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the embedding for the target course
        target_embedding = course_embeddings[course_id]["embedding"]
        similarities = []
        
        # Calculate similarity with all other courses
        for other_course_id, course_data in course_embeddings.items():
            if other_course_id != course_id:  # Don't recommend the same course
                similarity = cosine_similarity(target_embedding, course_data["embedding"])
                similarities.append({
                    "course_id": other_course_id,
                    "similarity": similarity,
                    "course_info": course_data["course_info"]
                })
        
        # Sort by similarity and get top 3
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_recommendations = similarities[:3]
        
        # Format response
        recommendations = []
        for rec in top_recommendations:
            recommendations.append({
                "code": rec["course_info"]["code"],
                "name": rec["course_info"]["name"],
                "description": rec["course_info"]["description"],
                "major": rec["course_info"]["major"],
                "credits": rec["course_info"]["credits"],
                "faculty": rec["course_info"]["faculty"],
                "similarity_score": round(rec["similarity"], 3)
            })
        
        return {
            "course_id": course_id,
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/summarize")
def summarize_course(request: SummarizeRequest):
    try:
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an educational assistant that helps summarize course descriptions."
                },
                {
                    "role": "user",
                    "content": f"Summarize this course description in 3-4 sentences, highlighting prerequisites, key concepts, and expected learning outcomes: {request.course_description}"
                }
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        summary = response.choices[0].message.content.strip()
        
        return {"summary": summary}
        
    except Exception as e:
        # Handle various OpenAI errors
        error_message = str(e)
        if "authentication" in error_message.lower():
            raise HTTPException(status_code=401, detail="Invalid OpenAI API key")
        elif "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="OpenAI API rate limit exceeded")
        elif "api" in error_message.lower():
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {error_message}")
        else:
            raise HTTPException(status_code=500, detail=f"Error generating summary: {error_message}")

@app.post("/select-course")
def select_course(request: CourseSelectionRequest):
    """Add a course to the selected courses list with course limit validation"""
    try:
        course_code = request.course_code
        
        # Find the course in the database
        course_found = None
        
        for major, courses in MAJORS_DATA.items():
            for course in courses:
                if course["code"] == course_code:
                    course_found = course
                    break
            if course_found:
                break
        
        if not course_found:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if course is already selected
        if course_code in [c["code"] for c in selected_courses]:
            raise HTTPException(status_code=400, detail="Course is already selected")
        
        # Check global course limit
        course_limit = get_course_limit()
        
        if len(selected_courses) >= course_limit:
            raise HTTPException(
                status_code=400, 
                detail=f"You cannot add more than {course_limit} courses."
            )
        
        # Add course to selected courses
        course_info = {
            "code": course_found["code"],
            "name": course_found["name"],
            "description": course_found["description"],
            "credits": course_found["credits"],
            "faculty": course_found["faculty"]["name"],
            "major": major
        }
        
        selected_courses.append(course_info)
        
        return {
            "success": True,
            "message": f"Course {course_code} added successfully",
            "selected_courses": selected_courses
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error selecting course: {str(e)}")

@app.delete("/remove-course/{course_code}")
def remove_course(course_code: str):
    """Remove a course from the selected courses list"""
    try:
        # Find and remove the course
        course_removed = False
        
        for i, course in enumerate(selected_courses):
            if course["code"] == course_code:
                selected_courses.pop(i)
                course_removed = True
                break
        
        if not course_removed:
            raise HTTPException(status_code=404, detail="Course not found in selected courses")
        
        return {
            "success": True,
            "message": f"Course {course_code} removed successfully",
            "selected_courses": selected_courses
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing course: {str(e)}")

@app.get("/selected-courses")
def get_selected_courses():
    """Get the current list of selected courses"""
    course_limit = get_course_limit()
    return {
        "selected_courses": selected_courses,
        "total_courses": len(selected_courses),
        "course_limit": course_limit
    }

# Authentication endpoints
@app.post("/signup")
def signup(request: SignUpRequest):
    """Sign up a new user"""
    try:
        # Validation
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        
        if not validate_email(request.email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        if len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # Check if email already exists
        if find_user_by_email(request.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new user
        users = load_users()
        new_uid = str(uuid.uuid4())
        
        new_user = {
            "uid": new_uid,
            "name": request.name.strip(),
            "email": request.email.lower().strip(),
            "password": request.password  # TODO: Hash password using bcrypt or similar for production
        }
        
        users.append(new_user)
        save_users(users)
        
        return {
            "success": True,
            "message": "User created successfully",
            "uid": new_uid
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.post("/login")
def login(request: LoginRequest):
    """Login user with email and password"""
    try:
        # Find user by email
        user = find_user_by_email(request.email.lower().strip())
        
        if not user or user["password"] != request.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {
            "success": True,
            "message": "Login successful",
            "uid": user["uid"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

@app.get("/welcome/{uid}")
def welcome(uid: str):
    """Get welcome message for user"""
    try:
        user = find_user_by_uid(uid)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "message": f"Welcome, {user['name']}!",
            "user_name": user["name"],
            "uid": uid,
            "has_registered_courses": len(get_user_registrations(uid)) > 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching welcome message: {str(e)}")

# Course Registration endpoints
@app.post("/complete-registration")
def complete_registration(request: CourseRegistrationRequest):
    """Complete user's course registration"""
    try:
        # Verify user exists
        user = find_user_by_uid(request.uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user's registered courses
        success = update_user_registrations(request.uid, request.courses)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save course registration")
        
        return {
            "success": True,
            "message": "Course registration completed successfully",
            "registered_courses": request.courses
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing registration: {str(e)}")

@app.get("/user-registrations/{uid}")
def get_user_course_registrations(uid: str):
    """Get user's registered courses"""
    try:
        user = find_user_by_uid(uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        registered_courses = get_user_registrations(uid)
        
        return {
            "uid": uid,
            "user_name": user["name"],
            "registered_courses": registered_courses,
            "total_courses": len(registered_courses),
            "registration_status": "completed" if registered_courses else "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user registrations: {str(e)}")

@app.delete("/user-registrations/{uid}")
def clear_user_registrations(uid: str):
    """Clear user's registered courses (for re-registration)"""
    try:
        user = find_user_by_uid(uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        success = update_user_registrations(uid, [])
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear registrations")
        
        return {
            "success": True,
            "message": "Course registrations cleared successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing registrations: {str(e)}")