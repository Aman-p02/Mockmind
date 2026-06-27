# 🚀 Mockmind - AI-Based Mock Interview Platform

You Can Try it Out From Here : https://mockmind-one.vercel.app/
Mockmind is an intelligent mock interview platform designed to help candidates prepare for their dream jobs. It simulates real-world interview scenarios using advanced AI and provides comprehensive feedback to improve candidate readiness.

## 🌟 Key Features

- **On-Campus Placement Mode:** A structured 11-question interview featuring fixed rounds (Aptitude ➔ DSA ➔ DBMS ➔ OS ➔ HR), perfectly simulating standard college placement processes.
- **Off-Campus Placement Mode:** A highly targeted 5-question technical interview that strictly adheres to the candidate's chosen domain (e.g., Frontend, Backend, Fullstack).
- **Voice & Text Input:** Speak your answers naturally using the Web Speech API or type them out.
- **Real-time AI Feedback:** Get instant evaluations, scores out of 10, strengths, and actionable areas for improvement after every interview.
- **Progress Tracking Dashboard:** Visualize your interview history, average scores, current streak, and top skills through interactive charts.
- **Resume Parsing (ATS Check):** Upload your resume to get an ATS compatibility score, missing keywords, and targeted suggestions.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** Tailwind CSS, Framer Motion (for smooth animations)
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Server:** Node.js with Express.js (TypeScript)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, JWT Authentication)
- **AI Integration:** [Groq API](https://groq.com/) utilizing the blazing-fast `llama-3.3-70b-versatile` model.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Supabase Project (URL and Anon Key)
- Groq API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Aman-p02/Mockmind.git

