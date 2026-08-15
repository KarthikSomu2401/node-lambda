# Lambda - Notes API

A simple Express.js REST API for managing notes using MongoDB and Mongoose.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB running locally on `127.0.0.1:27017`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/note_db
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
lambda/
├── index.js              # Main application entry point
├── package.json          # Project dependencies and metadata
├── .env                  # Environment variables (not committed)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── app/
    ├── model/
    │   └── note.js       # Note schema definition
    └── router/
        └── router.js     # API routes
```

## Database Schema

### Note
- `title` (String): Title of the note
- `description` (String): Description/content of the note

## API Endpoints

The API provides CRUD operations for notes via the `/note` route:

- `GET /note` - Get all notes
- `POST /note` - Create a new note
- `GET /note/:id` - Get a specific note
- `PUT /note/:id` - Update a note
- `DELETE /note/:id` - Delete a note

## Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **em-crud** - CRUD operations wrapper
- **esbuild** - JavaScript bundler

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/note_db` | MongoDB connection string |
| `NODE_ENV` | `development` | Environment mode |

## Development

To make changes:
1. Edit the files in the project
2. The server will need to be restarted manually for changes to take effect
3. Or use a tool like `nodemon` for automatic restarts

## License

MIT
