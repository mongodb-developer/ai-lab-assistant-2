# MongoDB AI Lab Assistant - Development Guide

## Build/Run Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Code Style Guidelines
- **No TypeScript** - Use vanilla JavaScript with JSDoc comments when needed
- **React/Next.js** - Use App Router (not pages directory)
- **UI Framework** - Material UI with proper component classes for styling
- **Error Handling** - Use early returns, structured try/catch blocks with console.error for errors
- **Component Style** - Use const arrow functions (`const Component = () => {}`)
- **Event Handlers** - Prefix with 'handle' (handleClick, handleSubmit)
- **Environment** - Secrets in .env/.env.local files
- **MongoDB** - Use Mongoose for schemas, defined in separate model files
- **Accessibility** - Implement a11y attributes (aria-label, tabIndex) on interactive elements
- **Next.js Patterns** - Async/await route params and cookies properly

## Data Persistence
- MongoDB with Mongoose for schema validation
- MongoDB Atlas Vector Search for embeddings and similarity search

## Important Project Files
- @QUESTION_PROCESSING.md - Contains guidelines for processing questions and formatting responses