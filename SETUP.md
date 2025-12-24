# Quick Setup Guide

## Step 1: Install Dependencies

Run this command from the root directory:

```bash
npm run install:all
```

This will install dependencies for:
- Root project (concurrently for running both servers)
- Frontend (React, TypeScript, Vite, etc.)
- Backend (Express)

## Step 2: Get Your OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (it starts with `sk-`)

**Important**: Keep this key secret! It's stored only in your browser's localStorage.

## Step 3: Start the Development Servers

```bash
npm run dev
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

## Step 4: First Time Setup in the App

1. Open `http://localhost:3000` in your browser
2. Click "API Settings" button
3. Paste your OpenAI API key
4. Click "Test Key" to verify it works
5. Click "Save"

## Step 5: Create Your First Problem

1. Click "New Problem" button
2. Enter a problem (e.g., "How do I implement a binary search tree?")
3. Click "Create"
4. Click "Solve with GPT" on the root node
5. Watch as GPT creates step-by-step solutions!

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Frontend**: Edit `frontend/vite.config.ts` and change the port
**Backend**: Edit `backend/server.js` and change `PORT`

### API Key Not Working

- Make sure you copied the entire key (starts with `sk-`)
- Check that you have credits in your OpenAI account
- Try testing the key again

### Dependencies Won't Install

Make sure you have Node.js 18+ installed:
```bash
node --version
```

If not, install from [nodejs.org](https://nodejs.org/)

### Frontend Only Development

If you want to skip the backend (since API calls are made from the browser):

```bash
cd frontend
npm install
npm run dev
```

The app will work fine without the backend server!

## Next Steps

- Read the main [README.md](./README.md) for more details
- Try creating sub-problems from any step
- Export your trees to save your work
- Experiment with different problem types!

