# Frontend (ad-sync-fe) — Claude Notes

## Responsive Design

The design must be **100% responsive**. All features must be fully available and functional on:

- **Desktop** (1024px and above)
- **Tablet** (768px – 1023px)
- **Mobile** (below 768px)

No feature should be hidden, disabled, or degraded on any breakpoint. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) to adapt layouts rather than removing functionality.

---

## TypeScript

- Always define explicit types for props, function parameters, and return values.
- **Never use `any`**. Use `unknown`, proper interfaces, or generics instead.
- Prefer `interface` for object shapes and `type` for unions/intersections.
- **All shared types must live in `lib/types.ts`** — never define a type inline in a component or `lib/api.ts` if it is used in more than one place. This is the single source of truth for all data shapes.
- API request/response types (`BrandRegisterPayload`, `OAuthCallbackResponse`, etc.) belong in `lib/types.ts`, not in `lib/api.ts`.
- Use `as const` for constant objects/arrays to get literal types.
- Avoid type assertions (`as Type`) unless absolutely necessary; prefer type guards instead.
- Generic components and hooks should use descriptive type parameter names (`TData`, `TError`).

```ts
// Good — defined once in lib/types.ts, imported everywhere
export interface BrandLoginPayload { email: string; password: string; }

// Bad — inline definition in a component or api.ts
interface BrandLoginPayload { ... }  // defined locally in login/page.tsx
```

```ts
// Good
interface PageProps {
  params: { id: string };
  searchParams: Record<string, string>;
}

// Bad — inline anonymous type used in multiple places
function Foo(props: { name: string; age: number }) { ... }
```

---

## Code Quality

- **No code duplication** — extract shared logic into reusable hooks (`hooks/`), utilities (`lib/`), or components (`components/`).
- **Always reuse existing components** — check `components/` before creating a new one. Extend or compose existing ones rather than building from scratch.
- **Large pages (200+ lines) should be split** into smaller focused components. Extract self-contained UI sections into `components/` rather than keeping everything in `app/`.
- Each component/page file should have a single clear responsibility — one concern per file.

```tsx
// Good — extract platform card into its own component
// components/connect/PlatformCard.tsx
export function PlatformCard({ platform, connected, onConnect }: PlatformCardProps) { ... }

// connect/page.tsx — imports and composes cards
import { PlatformCard } from '@/components/connect/PlatformCard';
```
- Follow Next.js best practices:
  - Use Server Components by default; add `"use client"` only when necessary (event handlers, browser APIs, hooks).
  - Fetch data in Server Components or Route Handlers, not in client components.
  - Use App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
  - Prefer `next/image` over `<img>` and `next/link` over `<a>` for internal navigation.
  - Keep route segments focused — one page, one responsibility.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (components) | `kebab-case.tsx` | `brand-card.tsx` |
| Files (hooks) | `use-kebab-case.ts` | `use-brand-auth.ts` |
| React components | `PascalCase` | `BrandCard` |
| Functions/variables | `camelCase` | `fetchBrandData` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| TypeScript types/interfaces | `PascalCase` | `BrandSession` |
| CSS class names | `kebab-case` (Tailwind) | `bg-brand-primary` |

---

## File & Component Structure

Each component file should be ordered:

1. Imports (React/Next → third-party → local)
2. Types / interfaces
3. Constants (component-local only; shared constants go in `lib/constants.ts`)
4. Component function
5. Sub-components (if small and only used here)

```tsx
// 1. Imports
import { useState } from 'react';
import { toast } from 'sonner';
import { brandAuthAPI } from '@/lib/api';
import type { BrandSession } from '@/types';

// 2. Types
interface BrandCardProps {
  brand: BrandSession['brand'];
  onDisconnect: () => void;
}

// 3. Component
export function BrandCard({ brand, onDisconnect }: BrandCardProps) {
  // hooks at the top
  const [loading, setLoading] = useState(false);

  // handlers
  const handleDisconnect = async () => { ... };

  // render
  return <div>...</div>;
}
```

---

## API Layer (`lib/api.ts`)

- All HTTP calls go through `lib/api.ts` — never call `axios` or `fetch` directly in components.
- Group endpoints by domain (e.g., `authAPI`, `brandAuthAPI`, `instagramAPI`).
- Always type request payloads and response shapes with explicit interfaces.
- Use the `useApi` hook (`hooks/useApi.ts`) for client-side data fetching — it manages `loading`, `error`, and `data` state uniformly.
- The Axios instance has no global auth interceptor; pass `Authorization: Bearer <token>` explicitly per call via helper functions like `_brandAuthHeaders(token)`.
- Never inline base URL strings — always use `process.env.NEXT_PUBLIC_API_URL`.

```ts
// Good — typed, grouped, uses helper
export const brandAuthAPI = {
  me: (token: string): Promise<AxiosResponse<MeResponse>> =>
    api.get('/brands/me', { headers: _brandAuthHeaders(token) }),
};

// Bad — untyped, not in api.ts
const res = await axios.get('http://localhost:8000/brands/me');
```

---

## State Management

- **React Context** for global state (auth, filters, sidebar, theme) — defined in `contexts/`.
- **Local `useState`** for component-local state that doesn't need to be shared.
- **`useApi` hook** for async data fetching state (loading/error/data).
- Do not use a state management library (Redux, Zustand, etc.) — the existing Context pattern is sufficient.
- Keep context values stable: memoize context objects with `useMemo` to avoid unnecessary re-renders.

```tsx
// Good — stable context value
const value = useMemo(() => ({ user, login, logout }), [user]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

---

## Performance

- Use `useCallback` for functions passed as props to child components or used as `useEffect` dependencies.
- Use `useMemo` for expensive computations, not for primitive values or simple object literals.
- Avoid creating objects/arrays inside JSX (causes re-renders on every render):

```tsx
// Bad
<Component style={{ margin: 8 }} options={['a', 'b']} />

// Good
const STYLE = { margin: 8 } as const;
const OPTIONS = ['a', 'b'] as const;
<Component style={STYLE} options={OPTIONS} />
```

- Prefer `next/dynamic` for heavy components not needed on initial render.
- Images: always provide `width`, `height`, or `fill` on `next/image`; use `priority` only for above-the-fold images.

---

## Error Handling

- Wrap page-level errors with `error.tsx` (App Router convention).
- In client components, catch API errors in `try/catch` and show user feedback via `toast` (Sonner):

```tsx
try {
  await execute(() => brandAuthAPI.logout(token));
  toast.success('Logged out');
} catch {
  toast.error('Failed to log out. Please try again.');
}
```

- Never show raw error objects or stack traces to the user.
- The `useApi` hook stores the `error` string — display it in the UI or fire a toast, don't leave it silent.
- Use `loading.tsx` for route-level loading states; use local `loading` state from `useApi` for component-level skeletons.

---

## Environment Variables

- Client-accessible variables must be prefixed `NEXT_PUBLIC_`.
- Server-only variables (no prefix) are never sent to the browser.
- Never hardcode base URLs, API keys, or secrets — always read from `process.env`.
- Document every variable in `.env.example` with a description.

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_API_URL` | `lib/api.ts` — base URL for backend |

---

## Constants

- App-wide magic values, label maps, and configuration live in `lib/constants.ts`.
- Component-local constants (used only in one file) can be defined at the top of that file.
- Never repeat string literals — define once, import everywhere.

```ts
// lib/constants.ts
export const PLATFORM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
} as const;

export type Platform = keyof typeof PLATFORM_LABELS;
```

---

## Accessibility

- All interactive elements must be keyboard-navigable and have accessible names.
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`) rather than generic `<div>` click handlers.
- Provide `alt` text for all `next/image` usages; use `alt=""` for decorative images.
- Use `aria-label` or `aria-labelledby` when the visible label is not sufficient.
- Radix UI primitives (used in `components/ui/`) handle most ARIA patterns automatically — use them.

---

## Testing (Playwright)

- Tests live in `tests/` and use Playwright (configured in `playwright.config.ts`).
- Test user-visible behavior, not implementation details.
- Use `data-testid` attributes for elements that are hard to target by role/text.
- Run tests with `npm run test`; open interactive UI with `npm run test:ui`.
- Each test file corresponds to a feature/page, not a single component.
