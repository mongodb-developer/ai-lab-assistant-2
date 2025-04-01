# MongoDB AI Lab Assistant

A Next.js application that provides AI-powered assistance for MongoDB questions and design reviews.

## Features

- AI-powered Q&A with vector search for MongoDB questions
- Design review submission and management
- User authentication with Google OAuth
- Admin dashboard for content management
- Material UI design system

## Tech Stack

- **Frontend**: React.js with Next.js App Router
- **UI Library**: Material UI
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Atlas Vector Search
- **AI Integration**: OpenAI API for embeddings and answers
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mongodb-ai-lab-assistant.git
cd mongodb-ai-lab-assistant
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration values
```

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Deployment on Vercel

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI
```bash
npm install -g vercel
```

3. Deploy to Vercel
```bash
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
