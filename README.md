# Cursor AI Web Platform

A web-based platform that allows users to interact with Cursor AI for code generation and editing through natural language commands.

## Features

- Natural language command interface for code generation and editing
- Web-based code editor with Monaco Editor
- Real-time code diff visualization
- AI-powered code generation and editing
- Secure user authentication
- Project management
- File system integration
- User-specific project directories

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript
- UI: Tailwind CSS, Headless UI
- Code Editor: Monaco Editor
- Backend: Next.js API Routes
- Authentication: Custom token-based auth
- AI Integration: Cursor AI

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Cursor AI CLI installed and configured

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cursor-ai-platform.git
   cd cursor-ai-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   CURSOR_API_KEY=your_cursor_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Authentication**
   - Sign in with your Cursor AI credentials
   - Each user gets their own isolated workspace

2. **Project Management**
   - Create new projects or open existing ones
   - Navigate through files using the file tree
   - Edit files using the Monaco Editor

3. **AI Commands**
   - Select a file to edit
   - Enter natural language commands in the command input
   - Example commands:
     - "Add a responsive navbar with logo and menu items"
     - "Create a login form with email and password fields"
     - "Add error handling to the API call"
     - "Refactor this component to use React hooks"

4. **Code Changes**
   - View real-time diffs of code changes
   - Accept or reject changes
   - Automatic file backups before modifications

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── run-command # Command execution endpoint
│   ├── components/     # React components
│   │   ├── CommandInput.tsx
│   │   ├── DiffViewer.tsx
│   │   └── FileTree.tsx
│   └── lib/           # Utility functions
│       └── cursor.ts  # Cursor AI integration
├── public/            # Static assets
└── styles/           # Global styles
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security

- User authentication required for all operations
- Sandboxed execution environment
- Secure file system access
- API rate limiting
- Automatic file backups
- Command validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 