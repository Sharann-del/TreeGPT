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
