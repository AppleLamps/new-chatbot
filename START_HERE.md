# 🚀 Quick Start Guide for LampChat

## First Time Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm run install:all
```
This installs packages for both frontend and backend.

### Step 2: Get OpenRouter API Key
1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to "Keys" section
4. Create a new API key
5. Copy the key

### Step 3: Configure Environment
```bash
cd backend
cp .env.example .env
```

Now edit `backend/.env` and paste your API key:
```
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
PORT=3001
```

### Step 4: Start the Application
```bash
cd ..
npm run dev
```

That's it! 🎉

The application will automatically start:
- ✅ Backend server on http://localhost:3001
- ✅ Frontend app on http://localhost:3000

Open your browser to **http://localhost:3000** and start chatting!

---

## Available Commands

From the root directory:

- `npm run dev` - Start both servers in development mode
- `npm run install:all` - Install all dependencies
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm start` - Start both servers in production mode

---

## Troubleshooting

### Port already in use?
If port 3000 or 3001 is already in use:
1. Stop the process using that port
2. Or change the port in `backend/.env` (PORT=3002)

### API key not working?
- Make sure you copied the full key including the `sk-or-v1-` prefix
- Verify the key is active at openrouter.ai
- Check there are no extra spaces in the `.env` file

### Frontend can't connect to backend?
- Make sure backend started successfully (check terminal output)
- Verify backend is running on port 3001
- Check `frontend/next.config.js` rewrites configuration

---

## Testing Features

Once running, try these features:

1. **Basic Chat** - Type a message and press Enter
2. **Voice Input** - Click microphone icon and speak
3. **File Upload** - Drag & drop images or documents
4. **Model Selection** - Choose different AI models from dropdown
5. **Dark Mode** - Toggle theme with moon/sun icon
6. **Follow-up Questions** - Click suggested prompts after AI responses
7. **Image Generation** - Enable purple image icon and request images
8. **Text-to-Speech** - Click speaker icon on AI messages

Enjoy! 💬✨

