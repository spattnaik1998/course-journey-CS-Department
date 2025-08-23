from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import numpy as np
from openai import OpenAI

app = FastAPI()

# In-memory view counter for analytics
view_counts = {}

# In-memory storage for course embeddings
course_embeddings = {}

# Request model for chatbot
class ChatRequest(BaseModel):
    question: str

# Request model for course summarization
class SummarizeRequest(BaseModel):
    course_description: str

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
                        "semester": course["semester"],
                        "faculty": course["faculty"]["name"]
                    }
                }
    print(f"Precomputed embeddings for {len(course_embeddings)} courses")

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
    try:
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Prepare course database context for the AI
        courses_context = ""
        for major, courses in MAJORS_DATA.items():
            courses_context += f"\n**{major} Department:**\n"
            for course in courses:
                courses_context += f"- {course['code']}: {course['name']} ({course['credits']} credits, {course['semester']})\n"
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
                        "semester": course["semester"],
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
                "semester": rec["course_info"]["semester"],
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