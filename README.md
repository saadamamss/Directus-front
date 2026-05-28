# DataForge Frontend

A headless CMS admin panel built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS v4**. Connects to the [DataForge API](https://github.com/saadamamss/Directus) to provide a dynamic, no-code content management experience.

## Overview

DataForge is a dynamic CMS — collections, fields, and relations are resolved at runtime **without code migrations**. The frontend uses a **Zustand store** synced with **React Query** for optimistic updates and instant UI feedback.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand + React Query |
| Forms | react-hook-form + Zod |
| Auth | HttpOnly JWT cookies (access + refresh tokens) |
| HTTP | Axios with response interceptor |
| Icons | Lucide React |
| Toasts | Sonner |
| Drawer | Vaul (Radix-based) |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── admin/
│   │   ├── (dashboard)/       # Authenticated layout (sidebar, header)
│   │   │   ├── content/       # Content management pages
│   │   │   │   ├── [collection]/
│   │   │   │   └── [collection]/[id]/
│   │   │   ├── settings/data-model/[collection]/  # Field & layout editor
│   │   │   └── files/         # File library
│   │   ├── login/             # Login page
│   │   └── profile/           # Profile & password change
│   └── layout.tsx             # Root layout (Toaster, fonts)
├── components/                # Shared UI components
│   ├── collections/           # Collection CRUD (create, list, delete)
│   ├── files/                 # File library drawer
│   ├── layout/                # Sidebar, header, page header
│   └── ui/                    # Generic UI (dialogs, inputs, select)
├── features/                  # Feature-specific components
│   ├── fields/                # Field type drawer (simple + advanced modes)
│   └── items/                 # Item form (create, edit, upload, file picker)
├── hooks/                     # Shared React hooks
├── lib/                       # API clients, queries, utilities
│   ├── api/                   # Axios client + endpoint functions
│   ├── query/hooks/           # React Query hooks (collections, fields, items, etc.)
│   └── auth.ts                # Auth helpers (login, logout, refresh)
├── middleware.ts              # Route guard — redirects to login if unauthenticated
├── stores/                    # Zustand stores
│   ├── appStore.ts            # Collections, fields, relations cache
│   └── authStore.ts           # User session state
├── shared/                    # Constants, utilities
└── types/                     # TypeScript type definitions
```

## Key Architecture Decisions

### Dynamic Collections & Fields
Collections, fields, and relations are **not** hard-coded. The app fetches the full schema on mount via the `/collections`, `/fields`, and `/relations` endpoints and caches them in a Zustand store. The React Query preloader blocks rendering until `initialized` is `true`.

### Store-First Mutations
CRUD operations update the Zustand store **optimistically** (not just React Query cache):
- `useCreateCollection`/`useDeleteCollection` → update `store.collections`
- `useCreateField` → `store.setFields([...store.fields, data])`
- `useUpdateField` → maps over `store.fields` replacing the matching field
- `useDeleteField` → filters `store.fields`
- All also call `store.refreshFields()` or `store.refreshRelations()` for a background sync

This avoids stale UI between the mutation response and the next query invalidation.

### Auth Flow
1. Login returns an HttpOnly cookie (`refreshToken`) + JSON body (`accessToken`)
2. Every API request includes `withCredentials: true` so cookies are sent automatically
3. On 401, the Axios interceptor calls `/auth/refresh` to get a new access token
4. If refresh also fails (401), the user is logged out
5. The interceptor **skips retry** for `/auth/refresh` itself to prevent deadlocks
6. Next.js middleware checks for cookies on `/admin/*` routes and redirects to login if missing

### Cross-Domain Deployment
When frontend (Vercel) and backend (Railway) are on different domains, `SameSite=None; Secure` cookies may still be blocked by modern browsers. The fix is a **Vercel rewrite**:

```js
// next.config.mjs
async rewrites() {
  return [{
    source: "/api/v1/:path*",
    destination: `${process.env.API_PROXY_URL}/api/v1/:path*`,
  }];
}
```

This makes API requests appear same-origin to the browser, so HttpOnly cookies work normally.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL (e.g. `http://localhost:5000/api/v1` for dev, `/api/v1` for Vercel) |
| `API_PROXY_URL` | No (Vercel) | Backend origin for Vercel rewrites (e.g. `https://directus-production-b548.up.railway.app`) |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) → the app redirects to `/admin/login`.

## Deployment

### Vercel
1. Connect the GitHub repository to Vercel
2. Set `NEXT_PUBLIC_API_URL=/api/v1`
3. Set `API_PROXY_URL=https://your-backend.railway.app`
4. Deploy — rewrites proxy `/api/v1/*` to the backend, keeping everything same-origin

## License

MIT
