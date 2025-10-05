# LampChat Backend

Express.js server for LampChat with OpenRouter integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your OpenRouter API key to `.env`:
```
OPENROUTER_API_KEY=your_actual_api_key_here
```

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Send chat message

### Chat Endpoint

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "model": "anthropic/claude-3-haiku:beta"
}
```

## Getting an OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env` file
