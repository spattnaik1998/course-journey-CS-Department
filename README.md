# Majors and Courses Web Application

A simple web application that displays majors and their associated courses.

## Structure
- `backend/` - FastAPI Python backend
- `frontend/` - React frontend

## Running the Application

### Backend (FastAPI)
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start the server:
   ```
   uvicorn main:app --reload --port 8000
   ```

The backend will be available at http://localhost:8000

### Frontend (React)
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000

## Usage
1. Visit http://localhost:3000 to see the list of majors
2. Click on any major to view its courses
3. Use the "Back to Majors" link to return to the main page

## API Endpoints
- `GET /majors` - Returns list of all majors
- `GET /courses/{major_id}` - Returns courses for a specific major