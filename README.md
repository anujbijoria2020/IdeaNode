# IdeaNode

A modern web application for saving and organizing various types of content including YouTube videos, tweets, Instagram posts, PDFs, and personal notes.

## Features

- 📝 Save and organize multiple content types:
  - YouTube videos with embedded players
  - Twitter posts with native embedding
  - Instagram posts and reels
  - PDF documents with preview
  - Personal notes with text formatting
- 🔍 Search through saved content
- 🔄 Real-time content updates
- 🔗 Share collections of content
- 🎨 Clean, minimal UI design
- 🔐 User authentication and content protection

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - Tailwind CSS for styling
  - Axios for API requests
  - React Router for navigation

- **Backend**:
  - Node.js
  - Express
  - MongoDB for data storage
  - JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- API keys for:
  - Twitter (for tweet embedding)
  - YouTube Data API
  - Instagram Basic Display API

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ideaNode.git
cd ideaNode
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create `.env` files in both frontend and backend directories:

Backend `.env`:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development servers:

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## Usage

1. Register/Login to your account
2. Add content by:
   - Pasting URLs for YouTube/Twitter/Instagram
   - Uploading PDF files
   - Creating text notes
3. View your saved content in the dashboard
4. Search through content using the search bar
5. Share collections using the share button

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License


