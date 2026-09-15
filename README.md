# Online Feedback & Survey Platform

A responsive web application for creating surveys, collecting structured feedback, viewing response analytics, and exporting survey results.

Built as an internship project using React and Supabase.

## 📌 Project Overview

The Online Feedback & Survey Platform provides a simple way to create feedback surveys and collect responses digitally.

The platform allows users to:

- Create surveys
- Add different types of questions
- Submit survey responses
- Provide additional suggestions or comments
- View collected responses and summarized results
- Export survey results as a CSV file
- Store survey data and responses using Supabase

## ✨ Features

### Survey Creation
- Create surveys with a title and description
- Add multiple questions
- Reusable survey builder interface
- Question validation before saving

### Supported Question Types
- Multiple Choice
- Short Answer
- Rating (1–5)
- Yes / No

### Feedback Collection
- User-friendly survey form
- Required question validation
- Additional suggestions/comments field
- Response data stored in Supabase

### Results Dashboard
- View total surveys
- View total responses
- View response counts for each survey
- View answer distribution for supported question types
- View short-answer responses
- View additional suggestions/comments

### CSV Export
- Export collected survey results
- CSV contains survey name, question, and answer data

### Responsive Design
- Clean and modern interface
- Responsive layout for different screen sizes
- Clear empty, loading, and error states

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

### Backend / Database
- Supabase
- PostgreSQL

### Development Tools
- Git
- GitHub
- ESLint
- npm

## 🗂️ Project Structure

```text
online-feedback-and-survey-platform/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ResultsDashboard.jsx
│   │   ├── SurveyBuilder.jsx
│   │   └── SurveyForm.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
