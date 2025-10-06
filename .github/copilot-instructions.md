# LampChat AI Coding Agent Instructions

## Project Overview
LampChat is a modern ChatGPT-like chatbot with Next.js frontend + Express backend, using OpenRouter API for multi-model access. Key differentiators: streaming SSE responses, multimodal I/O (images/documents/voice), intelligent prompt caching (90% cost savings), and glass-morphism UI with Geist typography.

## Architecture

### Monorepo Structure
- **Root**: Orchestrates with `concurrently` - `npm run dev` starts both servers
- **Frontend** (`frontend/`): Next.js 15 App Router, TypeScript, Tailwind with custom design system
- **Backend** (`backend/`): Express 4.x with modular controller/service pattern

### Data Flow
1. **Messages**: Frontend → `useStreamingChat` hook → Backend `/api/chat/stream` → OpenRouter → SSE streaming back
2. **File Uploads**: `FileUpload` component → Multer middleware → Base64 encoding → Embedded in OpenRouter messages
3. **State Management**: Client-side only, `localStorage` for sessions (`lampchat_sessions` key), no database

### Critical Integration Points
- **OpenRouter API**: All LLM requests go through `backend/services/openRouterService.js`
- **Streaming**: Uses SSE (Server-Sent Events), not WebSockets. Client buffers chunks every 50ms for smooth rendering
- **Prompt Caching**: Automatic for OpenAI/Grok/Groq; explicit `cache_control` for Anthropic/Gemini (see `backend/utils/cacheControl.js`)

## Development Workflows

### Starting Development
```bash
npm run install:all  # One-time: installs all dependencies
npm run dev          # Starts backend:4000 + frontend:3000
```
**Critical**: Backend requires `OPENROUTER_API_KEY` in `backend/.env` (copy from `.env.example`)

### Adding New Models
1. Update model ID in `frontend/components/ModelSelector.tsx` dropdown options
2. For image generation, use `OPENROUTER_CONFIG.imageGenerationModel` (currently Gemini 2.5 Flash)
3. Caching: OpenAI/Grok auto-cache; Anthropic/Gemini need `cache_control` in `messageFormatter.js`

### File Upload Processing
- PDFs/DOCX → `backend/services/documentService.js` extracts text server-side
- Images → Sent as base64 `image_url` in OpenRouter format
- Documents → Sent as base64 `file` type (OpenRouter parses natively, no text extraction needed)
- Storage: `backend/uploads/` (ensure `.gitignore` excludes this)

## Project-Specific Patterns

### Message Formatting Convention
**DO**: Use `backend/utils/messageFormatter.js` → `formatMessagesForOpenRouter()` for ALL OpenRouter requests
- Handles multimodal content (text/images/files)
- Applies caching breakpoints (system messages, large content >2000 chars, attachments)
- Image generation mode sends only last user message

**DON'T**: Manually construct OpenRouter message format - use the utility

### Streaming Response Pattern
```javascript
// Backend: chatController.js uses batched SSE sending
res.write(`data: ${JSON.stringify({ content: delta })}\n\n`)

// Frontend: useStreamingChat.ts buffers with 50ms flush interval
// Prevents UI lag from excessive re-renders
```

### Component State Management
- **Chat sessions**: Managed in `frontend/app/page.tsx`, persisted to `localStorage` on every update
- **Message state**: `useStreamingChat` hook (no Redux/Zustand - intentional simplicity)
- **Theme**: `useDarkMode` hook with `localStorage` persistence (`lampchat_theme` key)

### Glass-morphism UI System
Classes defined in `frontend/app/globals.css`:
- `.glass` - Standard backdrop blur with transparency
- `.glass-light` / `.glass-dark` - Mode-specific variants
- Applied to: Header, sidebar, message bubbles, model selector

**Animation Standards**: 
- Entrance: `animate-fade-in-up` (300ms)
- Hover: `transition-all duration-200 ease-out`
- Scale: `hover:scale-[1.02]` (subtle, not `1.1`)

## Key Files & Their Roles

### Backend Architecture
- `app.js` - App factory (middleware registration, route mounting)
- `server.js` - Entry point (calls `createApp()`, starts listener)
- `routes/index.js` - Central route registry (maps endpoints to controllers)
- `controllers/chatController.js` - Handles `/api/chat` and `/api/chat/stream`
- `services/openRouterService.js` - OpenRouter API client (chat, streaming, suggestions)
- `utils/messageFormatter.js` - **Critical**: Converts app messages → OpenRouter format with caching

### Frontend Architecture
- `app/page.tsx` - Main chat interface (700+ lines, manages sessions/state)
- `components/useStreamingChat.ts` - Core hook: SSE streaming, message state, error handling
- `components/MessageBubble.tsx` - Renders messages with Prism syntax highlighting, TTS
- `components/ChatList.tsx` - Sidebar session management (rename/delete/switch)
- `components/ModelSelector.tsx` - Dropdown with glass-morphism, custom chevron animation

## Common Tasks

### Adding a New API Endpoint
1. Create controller function in `backend/controllers/`
2. Register route in `backend/routes/` (create new router file if needed)
3. Import and mount in `backend/routes/index.js` → `registerRoutes()`
4. Update frontend hook (`useStreamingChat.ts`) or create new hook

### Debugging Streaming Issues
- Check backend console for OpenRouter errors (logged in `chatController.js`)
- Frontend: SSE events visible in Network tab → Preview (look for `data:` lines)
- Common issue: CORS headers missing (set in `config/express.js`)

### Modifying UI Animations
- Global keyframes in `frontend/app/globals.css` (e.g., `@keyframes fadeInUp`)
- Tailwind animation utilities in `tailwind.config.js` → `theme.extend.animation`
- Apply with: `animate-[name]` class (e.g., `animate-fade-in-up`)

## External Dependencies & Quirks

### OpenRouter API Specifics
- **Streaming format**: SSE with `data: {JSON}\n\n` format, ends with `[DONE]`
- **Image generation**: No streaming support (use regular `/chat/completions`)
- **Caching**: Anthropic requires `cache_control: { type: 'ephemeral' }` on last text part
- **File uploads**: Use `file` type with `file_data` base64 URL (not `image_url` for PDFs)

### Next.js 15 App Router
- All components are client components (`'use client'` at top)
- `globals.css` imported in `layout.tsx` (not `page.tsx`)
- Environment variables: `NEXT_PUBLIC_API_BASE_URL` for client-side API calls

### Tailwind Custom Config
- Font stack: Geist (primary) → Inter (fallback) → SF Pro
- Color system: `neutral` (grays), `brand` (primary), `accent` (interactions)
- Elevation: `shadow-elev-1` through `shadow-elev-4` (not standard Tailwind shadows)

## Testing & Validation

### Manual Testing Checklist
1. **Streaming**: Send message → Watch token-by-token rendering (no jumps)
2. **Sessions**: Create/rename/delete → Check `localStorage` persistence
3. **Files**: Upload image → Verify inline display + AI analysis
4. **Dark mode**: Toggle theme → Verify glass-morphism updates

### Common Pitfalls
- **Missing API key**: Backend logs warning but doesn't crash - check `.env`
- **CORS errors**: Frontend expects backend on port 4000 (update in `useStreamingChat.ts` if different)
- **Session loss**: Clearing `localStorage` wipes all chats (no backend persistence)
- **Large files**: Multer limits file size (check `config/multer.js` for limits)

## Design System Reference

### Typography Scale
- Display: `text-4xl font-light` (300 weight)
- Headings: `text-2xl font-semibold` (600 weight)
- Body: `text-base font-normal` (400 weight)
- Small: `text-sm font-medium` (500 weight)

### Spacing Convention
- Message bubbles: `p-4` (16px)
- Sidebar items: `p-4` with `gap-3` between
- Page margins: `max-w-4xl mx-auto` for content

### Color Usage
- User messages: `bg-brand-600 text-white`
- AI messages: `bg-neutral-100 dark:bg-neutral-800`
- Borders: `border-neutral-200 dark:border-neutral-700`
- Accent interactions: `hover:bg-brand-50 dark:hover:bg-brand-900/20`
