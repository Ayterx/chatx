# ChatX (BYOK Chat)

## Tech Stack

- Next.js
- Tailwind CSS
- Convex
- Vercel AI SDK

## Features

Features:

- Branch off
- Bring Your Own Key
- Clone Chat
- Delete Chat
- Edit message
- Mobile support
- Pin Chat
- Reasoning
- Rename Chat
- Retry message
- Share Chat
- Sync
- Syntax highlighting

## Getting Started

### 1. Install dependencies

```bash
# bash
pnpm install
```

### 2. Create a Convex project

```bash
# bash
pnpm dev:convex
```

### 3. Generate a JWT secret

```bash
# bash
pnpm generate-secret
```

Copy the output and add it to your Convex project’s environment variables.

### 4. Generate a Google OAuth client ID and secret

1. Go to the Google Cloud Console:  
   https://console.cloud.google.com/apis/dashboard

2. Set:

   - Origin to your app’s URL (e.g. http://localhost:3000).
   - Authorized redirect URI to your Convex HTTP Actions URL:  
     `CONVEX_SITE_URL`/api/auth/callback/google

3. Find `CONVEX_SITE_URL` in your Convex dashboard under  
   **Settings > URL & Deploy Key > Show development credentials > HTTP Actions URL**.  
   Ensure it ends with `.site`.

4. Add these to your Convex project’s environment variables:

   ```bash
   # bash
   AUTH_GOOGLE_ID="XXX"
   AUTH_GOOGLE_SECRET="XXX"
   SITE_URL="http://localhost:3000"
   ```

### 5. Build and run the app

```bash
# bash
pnpm build
pnpm start
```
