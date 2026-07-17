# 🎬 StreamFlix

StreamFlix is a full-stack movie streaming platform inspired by modern OTT applications. It is built with a backend-first architecture and focuses on secure authentication, role-based access control, cloud-based media management, HTTP byte-range video streaming, movie discovery, and personalized viewing features.

The platform allows administrators to manage movie content and upload thumbnails and videos to AWS S3, while users can browse published movies, stream videos, track their viewing progress, access watch history, and continue watching from where they left off.

---

## ✨ Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Access and refresh token support
- Secure password hashing
- Role-Based Access Control (RBAC)
- User and Admin roles
- Protected API routes
- User logout and session management

### 👤 User Management

- View user profile
- Edit profile information
- Upload and update profile avatar
- AWS S3-based avatar storage

### 🎬 Movie Management

Administrators can manage the complete movie lifecycle.

- Create movies
- Update movie information
- Delete movies
- Publish and unpublish movies
- Feature and unfeature movies
- Upload movie thumbnails
- Upload movie video files
- Replace existing thumbnails and videos
- Automatically clean up replaced S3 objects

### 🔎 Movie Discovery

Users can discover published movies through:

- Public movie catalog
- Movie details
- Search by movie title
- Genre filtering
- Pagination
- Sorting
- Featured movie
- Latest movies
- Dynamic genre list
- Similar movie recommendations based on genres

### ☁️ AWS S3 Media Storage

StreamFlix uses AWS S3 for cloud-based media storage.

- Avatar storage
- Movie thumbnail storage
- Movie video storage
- AWS SDK v3 integration
- IAM-based AWS access
- S3 object key management
- Automatic deletion of replaced media
- Stream-based large video uploads

Small media files such as images can be processed using buffers, while large video files are handled using file streams to avoid loading entire videos into server memory.

### ▶️ HTTP Video Streaming

StreamFlix implements HTTP byte-range streaming for efficient video playback.

Features include:

- HTTP `Range` request handling
- `206 Partial Content` responses
- `Content-Range` support
- `Accept-Ranges` support
- Partial video retrieval from AWS S3
- Node.js readable streams
- Browser video seeking
- Efficient memory usage

Instead of downloading an entire video before playback, the client requests only the required byte ranges.

```text
Browser
   │
   │ Range: bytes=0-1048575
   ▼
Express API
   │
   ▼
AWS S3
   │
   │ Partial Object Stream
   ▼
Express
   │
   │ 206 Partial Content
   ▼
Video Player
```

This enables faster playback and allows users to seek through videos without downloading the entire media file.

### 📺 Watch Progress

StreamFlix tracks the user's playback progress for each movie.

The system stores:

- Last playback position
- Video duration
- Watch progress percentage
- Completion status
- Last watched time

Only one watch-history document is maintained for each user-movie combination.

### ⏯️ Continue Watching

Users can resume unfinished movies from their previous playback position.

The Continue Watching API returns:

- Movie information
- Last playback position
- Watch percentage
- Completion status

This allows the frontend to display progress bars and resume playback from the correct timestamp.

### 📜 Watch History

Users can access their movie viewing history, including both completed and partially watched movies.

Watch history is ordered based on recent viewing activity.

---

# 🏗️ System Architecture

StreamFlix follows a layered backend architecture.

```text
                        ┌─────────────────────┐
                        │     Next.js UI      │
                        │      Frontend       │
                        └──────────┬──────────┘
                                   │
                                   │ HTTP / REST API
                                   ▼
                        ┌─────────────────────┐
                        │    Express Server   │
                        └──────────┬──────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
              Authentication      Users          Movies
                   │               │               │
                   │               │         ┌─────┴─────┐
                   │               │         ▼           ▼
                   │               │      Discovery   Streaming
                   │               │                     │
                   │               │                     ▼
                   │               │                  AWS S3
                   │               │
                   └───────────────┼───────────────┐
                                   ▼               ▼
                               MongoDB       Watch History
```

The backend follows:

```text
Route
  │
  ▼
Middleware
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Model / External Service
```

This separation keeps HTTP handling, business logic, database operations, and cloud integrations independent and maintainable.

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- TanStack Query

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Express Validator
- Multer

## Cloud & Storage

- AWS S3
- AWS IAM
- AWS SDK v3

## Streaming

- HTTP Range Requests
- HTTP 206 Partial Content
- Node.js Readable Streams
- AWS S3 Partial Object Retrieval

---

# 📂 Project Structure

```text
StreamFlix/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── movie/
│   │   │   └── player/
│   │   │
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── package.json
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── errors/
│   │   └── config/
│   │
│   ├── uploads/
│   │   └── videos/
│   │
│   └── package.json
│
└── README.md
```

---

# 🔄 Application Flow

## Admin Flow

```text
Admin Login
    │
    ▼
Admin Dashboard
    │
    ▼
Create Movie
    │
    ├── Upload Thumbnail ──────► AWS S3
    │
    ├── Upload Video ──────────► AWS S3
    │
    ├── Publish / Unpublish
    │
    └── Feature / Unfeature
```

## User Flow

```text
Register / Login
       │
       ▼
    Home Page
       │
       ├── Featured Movie
       ├── Latest Movies
       ├── Browse by Genre
       └── Continue Watching
              │
              ▼
        Movie Details
              │
              ├── Similar Movies
              │
              ▼
             Play
              │
              ▼
       HTTP Video Streaming
              │
              ▼
        Update Progress
              │
              ├── Watch History
              │
              └── Continue Watching
```

---

# 🔐 Authentication Flow

StreamFlix uses JWT-based authentication.

```text
User Login
    │
    ▼
Validate Credentials
    │
    ▼
Generate Tokens
    │
    ├── Access Token
    │
    └── Refresh Token
    │
    ▼
Authenticated Requests
    │
    ▼
Authentication Middleware
    │
    ▼
Role Authorization
    │
    ├── User
    │
    └── Admin
```

Admin-specific movie management operations are protected using role-based authorization.

---

# ☁️ Media Upload Architecture

## Image Upload

Images such as avatars and movie thumbnails are uploaded to AWS S3.

```text
Client
   │
   ▼
Multer
   │
   ▼
Express
   │
   ▼
AWS S3
   │
   ▼
Store S3 Key + URL
   │
   ▼
MongoDB
```

## Large Video Upload

Large video files use disk-based temporary storage and streams.

```text
Client
   │
   ▼
Multer Disk Storage
   │
   ▼
Temporary Video File
   │
   ▼
Node.js Read Stream
   │
   ▼
AWS S3
   │
   ▼
Delete Temporary File
   │
   ▼
Store Video Metadata
   │
   ▼
MongoDB
```

This approach avoids loading large video files entirely into Node.js memory.

---

# 🔄 Media Replacement Strategy

When an administrator replaces an existing thumbnail or video, StreamFlix follows a safe replacement strategy.

```text
Upload New Media
       │
       ▼
Update MongoDB
       │
       ▼
Delete Old S3 Object
```

The old object is deleted only after the new media has been successfully uploaded and stored.

This reduces the risk of losing the currently valid media if a new upload fails.

---

# 🎥 Video Streaming Architecture

When the video player requests a movie:

```text
GET /movies/:id/stream
```

The browser sends a Range header:

```http
Range: bytes=0-1048575
```

The backend:

1. Reads the requested byte range.
2. Retrieves video metadata from S3.
3. Requests only the required portion of the S3 object.
4. Returns the video stream with HTTP status `206 Partial Content`.

Example response headers:

```http
HTTP/1.1 206 Partial Content

Accept-Ranges: bytes
Content-Range: bytes 0-1048575/500000000
Content-Length: 1048576
Content-Type: video/mp4
```

This architecture allows:

- Immediate video playback
- Efficient seeking
- Lower memory consumption
- Partial content delivery

---

# 📡 API Overview

> Endpoint paths may vary depending on the route prefix configured in the application.

## Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

## User

```text
GET     /api/users/profile
PATCH   /api/users/profile
PATCH   /api/users/avatar
```

## Admin Movie Management

```text
POST     /api/movies
GET      /api/movies
GET      /api/movies/:id
PATCH    /api/movies/:id
DELETE   /api/movies/:id

PATCH    /api/movies/:id/publish
PATCH    /api/movies/:id/unpublish

PATCH    /api/movies/:id/feature
PATCH    /api/movies/:id/unfeature

PATCH    /api/movies/:id/thumbnail
PATCH    /api/movies/:id/video
```

## Public Movie APIs

```text
GET   /api/movies/public
GET   /api/movies/public/:id

GET   /api/movies/featured
GET   /api/movies/latest
GET   /api/movies/genres

GET   /api/movies/:id/similar
```

Example queries:

```text
GET /api/movies/public?search=interstellar

GET /api/movies/public?genre=Sci-Fi

GET /api/movies/public?page=1&limit=12

GET /api/movies/public?sort=latest

GET /api/movies/public?genre=Action&sort=latest&page=1
```

## Video Streaming

```text
GET /api/movies/:id/stream
```

Supports HTTP byte-range requests.

## Watch Activity

```text
POST   /api/watch-history/progress
GET    /api/watch-history
GET    /api/watch-history/continue
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- An AWS account
- An AWS S3 bucket
- AWS IAM credentials with the required S3 permissions

---

# 📥 Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd StreamFlix
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

FRONTEND_URL=http://localhost:3000
```

> Never commit your `.env` file or AWS credentials to GitHub.

Start the backend:

```bash
npm run dev
```

The backend will typically run on:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another terminal.

```bash
cd frontend
npm install
```

Create the frontend environment configuration if required.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will typically run on:

```text
http://localhost:3000
```

---

# 🔒 Security Considerations

StreamFlix implements several security practices:

- Password hashing
- JWT authentication
- Access and refresh tokens
- Role-based authorization
- Protected admin endpoints
- File type validation
- Upload size restrictions
- Environment-based secret management
- AWS IAM-based S3 access

Production deployments should additionally configure:

- HTTPS
- Secure and HTTP-only cookies where applicable
- Strict CORS policies
- Rate limiting
- Request logging
- Input sanitization
- Private S3 objects with signed access where appropriate

---

# ⚡ Performance Considerations

The project includes several performance-oriented design decisions:

### Pagination

Movie catalog endpoints use pagination to avoid returning the entire database in a single response.

### Lean Queries

Read-heavy endpoints can use Mongoose `.lean()` to avoid unnecessary document hydration.

### Streaming

Large videos are streamed rather than loaded entirely into memory.

### Partial Content

Only requested portions of videos are retrieved from AWS S3.

### Selective Population

Watch-history APIs can populate only the movie fields required by the frontend.

---

# 🚀 Future Improvement

## Redis Caching

Redis may be introduced to cache frequently requested data such as:

- Featured movie
- Latest movies
- Genre lists
- Popular movie detail responses

This can reduce repeated MongoDB queries and improve response times for read-heavy endpoints.

---

# 🧠 Key Concepts Demonstrated

This project demonstrates practical understanding of:

- REST API design
- Layered backend architecture
- Authentication vs authorization
- Role-Based Access Control
- JWT access and refresh tokens
- MongoDB data modeling
- Mongoose relationships and population
- Pagination and filtering
- Cloud object storage
- AWS IAM permissions
- Large file handling
- Node.js streams
- HTTP Range Requests
- HTTP `206 Partial Content`
- Stateful user viewing progress
- Upsert operations
- Media lifecycle management
- Backend business-rule enforcement

---

# 📸 Screenshots

Screenshots and demos can be added here once the frontend is complete.

```text
Home Page
Movie Details Page
Video Player
Continue Watching
User Profile
Admin Dashboard
```

---

# 🎯 Project Motivation

StreamFlix was built to explore the backend engineering challenges involved in creating a modern media streaming application.

Rather than focusing only on basic CRUD operations, the project explores practical engineering problems such as:

- How to securely manage users and administrative permissions.
- How to store large media files outside the application database.
- How to upload large videos without excessive memory usage.
- How HTTP byte-range requests enable efficient video playback and seeking.
- How to track user viewing progress without creating duplicate records.
- How to safely replace cloud-stored media.
- How to structure a growing backend using controllers, services, models, middleware, and utilities.

---

# 👨‍💻 Author

**Kamal**

Computer Science Student  
Indian Institute of Technology (BHU), Varanasi

---

# 📄 License

This project is intended for educational and portfolio purposes.

You may add an open-source license such as MIT if you plan to make the project publicly reusable.

---

⭐ If you found this project useful, consider giving the repository a star.
