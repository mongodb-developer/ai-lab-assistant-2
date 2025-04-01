# MongoDB AI Lab Assistant: Migration Guide from Flask to Next.js

This guide will help you migrate your existing MongoDB AI Lab Assistant from a Flask-based Python application to a modern React/Next.js application with MongoDB integration. The new setup provides improved performance, better user experience, and easier deployment on Vercel.

## Why Migrate to Next.js?

- **Modern UI**: React with Material UI provides a responsive and intuitive user interface
- **Enhanced Performance**: Server-side rendering and API routes improve performance and SEO
- **Simplified Deployment**: Vercel provides seamless deployment with automatic CI/CD
- **Better Developer Experience**: Hot module reloading, component-based architecture, and improved testing

## 1. Architecture Comparison

### Current Architecture (Flask)
- **Backend**: Python Flask with MongoDB integration
- **Frontend**: Jinja2 templates with some JavaScript
- **Deployment**: Google Cloud App Engine
- **Authentication**: Custom authentication or OAuth
- **AI Integration**: OpenAI API (embeddings and question answering)

### New Architecture (Next.js)
- **Backend**: Next.js API routes with MongoDB integration
- **Frontend**: React components with Material UI
- **Deployment**: Vercel (optimized for Next.js)
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Same OpenAI API functionalities

## 2. Migration Strategy

### 2.1 Data Migration

No direct data changes are required as we're keeping MongoDB as the database. The application will continue using the same database collections and schema.

#### MongoDB Schema Overview:
```
- users: User accounts and authentication data
- documents: Main collection for questions and answers with vector embeddings
- conversations: Chat history between users and the system
- unanswered_questions: Questions that couldn't be answered from the database
- design_reviews: Design review requests and responses
```

### 2.2 API Endpoint Mapping

| Flask Route | Next.js API Route |
|-------------|-------------------|
| `/auth/login` | `/api/auth/[...nextauth]/route.js` |
| `/chat/question` | `/api/chat/route.js` |
| `/admin/questions` | `/api/admin/questions/route.js` |
| `/admin/users` | `/api/admin/users/route.js` |
| `/design-review` | `/api/design-review/route.js` |

### 2.3 Functionality Migration

#### Authentication
- Replace Flask authentication with NextAuth.js
- Implement Google OAuth for simplified login
- Maintain admin role capabilities

#### Chat Functionality
- Migrate vector search logic to Next.js API routes
- Keep the core OpenAI integration code with minimal changes
- Enhance UI with React components for better interactivity

#### Admin Features
- Create React-based admin dashboard
- Implement question management interface
- Add user management capabilities

#### Design Review System
- Build React form for design review submission
- Create admin interface for review management
- Maintain the review workflow and email notifications

## 3. Implementation Steps

### 3.1 Project Setup

Run the provided setup script to create the initial project structure:

```bash
bash setup_script.sh
```

This creates the Next.js application with all necessary directories, components, and configuration files.

### 3.2 Environment Configuration

Configure your environment variables in `.env.local`:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
MONGODB_DB=ai_lab_assistant

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Application Settings
SIMILARITY_THRESHOLD=0.91
```

### 3.3 MongoDB Vector Search Setup

Ensure your MongoDB Atlas cluster is configured with Vector Search capability:

1. Create a vector search index on your `documents` collection
2. Index configuration for question embeddings:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "question_embedding",
         "numDimensions": 1536,
         "similarity": "cosine"
       }
     ]
   }
   ```

### 3.4 Development and Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test each feature thoroughly:
   - User authentication
   - Question answering
   - Vector search functionality
   - Admin dashboard features
   - Design review workflow

3. Compare results with your Flask application to ensure consistency

### 3.5 Deployment on Vercel

1. Push your code to a GitHub repository

2. Connect to Vercel:
   - Create a Vercel account if you don't have one
   - Import your repository
   - Configure environment variables in Vercel dashboard
   - Deploy the application

3. Set up custom domain if needed

## 4. Ongoing Maintenance

### 4.1 Monitoring

- Set up Vercel Analytics for front-end performance monitoring
- Configure MongoDB Atlas monitoring for database performance
- Implement error tracking with a service like Sentry

### 4.2 Updates and Improvements

- Regular dependency updates
- New feature development using React components
- Performance optimizations
- UI/UX improvements

## 5. Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Vercel Documentation](https://vercel.com/docs)

## 6. Troubleshooting Common Issues

### MongoDB Connection Issues
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check connection string in environment variables
- Verify network connectivity

### Authentication Problems
- Check Google OAuth configuration
- Verify NextAuth.js setup and callbacks
- Ensure NEXTAUTH_SECRET is properly set

### Vector Search Not Working
- Confirm vector search index is properly created
- Verify embedding dimensions match (1536 for OpenAI embeddings)
- Check similarity threshold configuration

### Deployment Issues
- Verify all environment variables are set in Vercel
- Check build logs for any errors
- Ensure Node.js version compatibility
