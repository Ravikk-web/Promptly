<div align="center">
  <div style="background: linear-gradient(to right, #8b5cf6, #4f46e5); padding: 2px; border-radius: 1rem; display: inline-block;">
    <div style="background: #0f172a; padding: 20px; border-radius: 1rem;">
      <h1 style="margin: 0; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; color: transparent; font-size: 3rem;">PROMPTLY</h1>
    </div>
  </div>
  <h3>Master the Art of Prompt Engineering</h3>
  <p>Instant feedback, real-time analysis, and intelligent optimization for your AI prompts.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
  ![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=google&logoColor=white)
</div>

<br />

## 🚀 Overview

**Promptly** is a powerful developer tool designed to help you write better prompts for Large Language Models (LLMs). It uses advanced AI analysis to evaluate your prompts, identify weaknesses, and generate optimized versions instantly.

Whether you are targeting Google Gemini, OpenAI's GPT-4, or Anthropic's Claude, Promptly helps you structure your inputs for maximum efficacy.

## ✨ Features

- **Real-time Analysis**: Get an instant score (0-100) on your prompt's quality.
- **Intelligent Feedback**: 
  - <span style="color: #ef4444">Red</span> highlights for vague or weak segments.
  - <span style="color: #10b981">Green</span> highlights for optimized improvements.
- **Multi-Provider Support**: 
  - **Google Gemini** (Recommended/Default)
  - **OpenAI** (ChatGPT)
  - **Anthropic Claude**
  - **Local Models** (LM Studio, Ollama via local server)
- **JSON Mode**: View improved prompts in structured JSON format for programmatic use.
- **History Tracking**: Automatically saves your analysis history locally.
- **Privacy First**: API keys are stored in your browser's local storage and never sent to our servers.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Lucide React (Icons)
- **AI Integration**: Google Generative AI SDK (`@google/genai`)
- **Animation**: HTML5 Canvas Particle System

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ravikk-web/Promptly.git
   cd Promptly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔑 Configuration

Promptly supports a "Bring Your Own Key" (BYOK) architecture. 

### Option 1: Quick Setup (.env)
Create a `.env` file in the root directory for default access (useful for personal deployment):
```env
VITE_API_KEY=your_google_gemini_api_key
```

### Option 2: UI Configuration
You can enter your API keys directly in the application Settings menu.
1. Click the **Settings** (Gear) icon.
2. Select your provider (Google, OpenAI, Claude, or Local).
3. Enter your API Key or Base URL.
4. Click **Save**. Note: Keys are stored in `localStorage`.

## 📂 Project Structure

```
Promptly/
├── src/
│   ├── components/      # UI Components (FeedbackDisplay, HistorySidebar, etc.)
│   ├── services/        # AI Provider integrations (geminiService.ts)
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx          # Main Application Logic
│   └── index.css        # Global Styles & Tailwind Directives
├── public/              # Static assets
└── ...config files      # Vite, Tailwind, PostCSS, TypeScript configs
```

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to proceed.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
