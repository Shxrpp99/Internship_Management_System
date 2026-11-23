# IMS - React Frontend

Modern React 19 + Vite frontend for the Internship Management and Monitoring System (IMS).

## Features
- **Role-Based Portals**:
  - **Student**: Profile management, browse/search internships, submit CVs (PDF/DOCX), track application status, submit weekly progress reports, view supervisor feedback, see final evaluations.
  - **Company**: Manage company profile, post internship openings with seat quotas and deadlines, review applicant resumes, download CVs, accept/reject candidates, submit final evaluations.
  - **Supervisor**: View assigned students, review weekly progress reports, submit feedback/guidance (`REVIEWED` or `CHANGES_REQUESTED`), submit final evaluation scores (1-100) and remarks.
  - **Admin**: System metrics overview, approve/reject company registrations, assign supervisors to accepted students, manage user accounts (create, activate, deactivate, delete).
- **One-Click Quick Login**: Preset buttons on the login screen for instant demo switching between all 4 roles.
- **Port Matching**: Preconfigured for backend port `8081` via `.env` and Vite proxy.

## Prerequisites
- Node.js 18+ or 20+ (can be installed on Windows with `winget install OpenJS.NodeJS`)
- Spring Boot backend running on `http://localhost:8081`

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

## Configuration

If your backend is running on a different port or domain, adjust `.env`:
```env
VITE_API_URL=http://localhost:8081/api
```
