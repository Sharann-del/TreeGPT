# TreeGPT

A hierarchical problem-solving system with tree visualization that uses ChatGPT (OpenAI API) to solve problems and sub-problems with backtracking and context-aware reasoning.

## Features

- 🌳 **Tree-based Problem Visualization**: Visualize problems and solutions as an interactive tree
- 🔄 **Sub-problem Creation**: Create sub-problems from any step and solve them independently
- 🔙 **Backtracking**: Apply sub-problem solutions back to parent problems
- 🔐 **Bring Your Own Key (BYOK)**: Users provide their own OpenAI API keys (stored locally)
- 💾 **Save/Load**: Export and import problem trees as JSON
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Library**: React Flow for tree visualization
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express (minimal, mainly for serving)
- **Storage**: LocalStorage (for API keys and trees)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

### First Time Setup

1. Open the app in your browser
2. Click "API Settings" and enter your OpenAI API key
3. Test the key to verify it works
4. Start creating problems!

## Usage

1. **Create a Root Problem**: Click "New Problem" and enter your problem
2. **Solve with GPT**: Click "Solve with GPT" on the root node to get step-by-step solutions
3. **Create Sub-problems**: Click any step node and create a sub-problem if something is unclear
4. **Apply Solutions**: After solving a sub-problem, click "Apply Solution to Parent" to update the parent step
5. **Export/Import**: Save your work by exporting trees as JSON files

## Project Structure

```
TreeGPT/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # OpenAI API service
│   │   ├── store.ts        # Zustand state management
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
├── backend/
│   └── server.js           # Express server
└── package.json
```

## How It Works

### Context-Aware Prompts

The system maintains context for each node:
- **Root problems** get a standard problem-solving prompt
- **Sub-problems** receive context about their parent and ancestors
- **Parent updates** incorporate sub-problem solutions back into the original steps

### Tree Structure

Each node in the tree represents:
- A problem or step
- Its solution (from GPT)
- Status (open, solving, solved, revised)
- Children (sub-problems or sub-steps)
- Context from ancestors

### BYOK Model

- API keys are stored in browser localStorage
- Keys never leave the user's device
- Each user pays for their own API usage
- No server-side API key storage

## Development

### Frontend Only Development

If you want to develop without the backend:

```bash
cd frontend
npm run dev
```

The frontend can work standalone since API calls are made directly from the browser.

### Building for Production

```bash
npm run build
```

The built files will be in `frontend/dist/`.

## 🔐 Security & API Key Safety

**IMPORTANT**: TreeGPT uses a BYOK (Bring Your Own Key) model. Your API key is stored **only in your browser's localStorage** and never sent to our servers.

### ✅ Safe Practices

- ✅ Enter your API key only in the app UI
- ✅ Your key stays on your device
- ✅ No hardcoded keys in the codebase
- ✅ Keys are never committed to Git

### ❌ Never Do This

- ❌ **NEVER** hardcode API keys in source code
- ❌ **NEVER** commit API keys to Git/GitHub
- ❌ **NEVER** share your API key publicly

### 🛡️ Protection Tools

We've included scripts to help prevent accidental key exposure:

```bash
# Setup Git hooks to check for keys before committing
bash scripts/setup-git-hooks.sh

# Manually check for exposed keys
bash scripts/check-api-keys.sh
```

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## Cost Considerations

- **Development**: You only pay for your own API testing
- **Users**: Each user pays for their own API usage via BYOK
- **Hosting**: Minimal cost (static site hosting is often free)

## Future Enhancements

- [ ] Collaborative trees (share with others)
- [ ] Multiple model support (GPT-4, Claude, etc.)
- [ ] Markdown rendering for solutions
- [ ] Search within trees
- [ ] Tree templates
- [ ] Desktop app (Electron/Tauri)

## License

MIT

## Contributing

This is a personal project, but suggestions and feedback are welcome!

