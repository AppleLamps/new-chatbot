# LampChat

A modern, ChatGPT-like chatbot application built with Next.js and Node.js.

## Features

### Core Chat Features
- **Clean UI**: Responsive chat interface with Tailwind CSS
- **Multiple Models**: Access to various LLMs through OpenRouter
- **Real-time Streaming**: Token-by-token message streaming
- **Chat Management**: Multiple sessions, rename/delete chats
- **Message Editing**: Edit user messages and regenerate AI responses
- **Markdown Support**: Code syntax highlighting with Prism

### Multi-modal Support (Phase 3) ✨
- **Image Uploads**: Upload and analyze images with vision-capable models
- **Image Generation**: AI-powered image generation with OpenRouter
- **Document Support**: Upload PDF and DOCX files with automatic text extraction
- **Voice Input**: Speech-to-text using Web Speech API
- **Text-to-Speech**: Read aloud assistant responses
- **Drag & Drop**: Easy file upload with preview
- **Inline Display**: Images displayed directly in chat messages

### Performance & Cost Optimization ⚡
- **Prompt Caching**: Intelligent caching of system messages and large content
- **Cost Savings**: Up to 90% reduction on cached tokens with Anthropic models
- **Auto-optimization**: Automatic caching for OpenAI, Grok, Groq, and DeepSeek
- **Smart Strategy**: Caches system messages, large documents, and early context
- **Usage Tracking**: Monitor cache performance and cost savings

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, OpenRouter API
- **Deployment**: Vercel/Netlify + Railway/Render

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation & Setup

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure Backend** (one-time setup):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your OpenRouter API key
   cd ..
   ```

3. **Start both servers** (single command!):
   ```bash
   npm run dev
   ```
   - Backend runs on `http://localhost:3001`
   - Frontend runs on `http://localhost:3000`

4. **Visit**: http://localhost:3000 and start chatting!

### Alternative: Manual Start

If you prefer to start servers separately:

**Backend** (in one terminal):
```bash
cd backend
npm run dev
```

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

## API Key Setup

Get your OpenRouter API key from [OpenRouter.ai](https://openrouter.ai/) and add it to `backend/.env`:

```
OPENROUTER_API_KEY=your_api_key_here
```

## Project Structure

```
lampchat/
├── frontend/                  # Next.js app
│   ├── app/                  # App directory (Next.js 14)
│   │   ├── page.tsx         # Main chat interface
│   │   └── globals.css      # Global styles
│   └── components/           # React components
│       ├── ChatList.tsx     # Chat session sidebar
│       ├── MessageBubble.tsx # Message display with TTS
│       ├── FileUpload.tsx   # Image/document upload
│       ├── VoiceInput.tsx   # Speech-to-text
│       └── useStreamingChat.ts # Chat state management
├── backend/                  # Express.js API
│   ├── server.js            # Main server with all endpoints
│   ├── uploads/             # Uploaded files storage
│   └── .env                 # API keys (not in git)
├── requirements.md          # Feature specifications
└── working.md              # Development progress
```

## Usage

### Basic Chat
- Type your message and press Enter or click Send
- AI responses stream in real-time
- Create new chat sessions with the "New Chat" button
- Switch between chats using the sidebar

### Multi-modal Features

**Image Upload**:
1. Click the attachment icon or drag and drop an image
2. Supported formats: JPEG, PNG, GIF, WebP
3. Images are displayed inline and can be analyzed by the AI

**Document Upload**:
1. Upload PDF or DOCX files
2. Text is automatically extracted and added to your message
3. Ask questions about the document content

**Voice Input**:
1. Click the microphone icon
2. Speak your message
3. Click again to stop and send

**Text-to-Speech**:
1. Hover over any assistant message
2. Click the speaker icon to read aloud
3. Click again to stop

**Image Generation**:
1. Click the purple image icon button to enable image generation
2. Request an image in your message (e.g., "Generate a sunset over mountains")
3. Generated images appear inline in the AI's response
4. Works with streaming responses for real-time generation

### Prompt Caching
The application automatically optimizes costs through intelligent prompt caching:

- **Automatic for most models**: OpenAI, Grok, Groq, Moonshot AI, and DeepSeek
- **Smart caching strategy**: 
  - System messages are always cached
  - Large content (>1000 characters) in early messages
  - Uploaded document content
- **Cost savings**: Up to 90% on cached content with Anthropic models
- **Performance boost**: Faster responses with cached prompts

## Development

### Completed Phases
- ✅ **Phase 1**: MVP with basic chat functionality
- ✅ **Phase 2**: Enhanced chat experience with streaming, markdown, and session management
- ✅ **Phase 3**: Multi-modal support (images, documents, voice, TTS, image generation)
- ✅ **Optimization**: Prompt caching for cost reduction and performance

### Next Steps
- Phase 4: RAG implementation, authentication, and advanced features
- See `working.md` for detailed progress tracking

## License

MIT
