# Port Migration Summary

## Changes Made

### 1. Backend Port Configuration
- **File**: `backend/server.js`
- **Change**: Updated default port from `3001` to `4000`
  ```js
  const PORT = process.env.PORT || 4000
  ```

### 2. Frontend API Configuration
- **File**: `frontend/next.config.js`
- **Changes**:
  - Added `outputFileTracingRoot: path.join(__dirname, '..')` to fix Next.js workspace warning
  - Updated all API rewrites to use environment variable `NEXT_PUBLIC_API_BASE_URL` with fallback to `http://localhost:4000`
  - All hardcoded `http://localhost:3001` references replaced with dynamic configuration

### 3. Frontend Hook Configuration
- **File**: `frontend/components/useStreamingChat.ts`
- **Change**: Updated default API URL from `http://localhost:3001` to `http://localhost:4000`

## Required Manual Steps

Since `.env` files are gitignored, you need to create them manually:

### 1. Create `backend/.env`
```env
PORT=4000
OPENROUTER_API_KEY=your_actual_api_key_here
```

### 2. Create `frontend/.env.local`
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## What This Fixes

1. ✅ **Port Collision**: Backend now runs on port 4000, eliminating conflicts with Next.js dev server
2. ✅ **Workspace Warning**: Added `outputFileTracingRoot` to fix Next.js multiple lockfiles warning
3. ✅ **Flexible Configuration**: All ports now configurable via environment variables
4. ✅ **API Connectivity**: Frontend correctly points to new backend port

## About `util._extend` Deprecation Warning

After investigating the codebase:
- ❌ **Not in our code**: No `util._extend` usage found in our application code
- 📦 **From dependencies**: The warning originates from Node.js dependencies, primarily:
  - Next.js compiled code (`frontend/node_modules/next/dist/compiled/util/util.js`)
  - Other transpiled packages in node_modules

### Recommendation
This deprecation warning is harmless and will be resolved when dependency maintainers update their code. No action needed on our part unless:
1. The warning becomes an error in a future Node.js version
2. You want to upgrade to the latest Next.js version (which may have fixed this)

## Testing Instructions

1. **Create the `.env` files** as shown above
2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```
3. **Start the development servers**:
   ```bash
   npm run dev
   ```
4. **Verify**:
   - Backend should start on port 4000
   - Frontend should start on port 3000 (default Next.js port)
   - Open http://localhost:3000 and test chat functionality
   - Check browser console and terminal for any errors
   - Verify file uploads work correctly

## Port Reference Table

| Service | Old Port | New Port | Configurable Via |
|---------|----------|----------|------------------|
| Backend | 3001 | 4000 | `backend/.env` → `PORT` |
| Frontend | 3000 | 3000 | Next.js default |
| API Calls | 3001 | 4000 | `frontend/.env.local` → `NEXT_PUBLIC_API_BASE_URL` |

## Rollback Instructions

If you need to revert to port 3001:
1. Set `PORT=3001` in `backend/.env`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` in `frontend/.env.local`
3. Restart both servers

