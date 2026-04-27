# Frontend (echofold-fe) — Claude Notes

> **Product name: Echofold.** The repo is still named `ad-sync-fe` for historical reasons. All user-facing copy, metadata, and assets must say "Echofold." Do not introduce "AdSync" anywhere new.

---

## Echofold Brand System (read this before adding any UI)

Every new screen, empty state, loader, modal, or marketing surface must compose from these primitives. Do not reinvent them, do not introduce new spinner styles, and do not write a generic empty state — use the components below.

### Brand voice
- Calm-intelligent, agency-grade. Senior strategist, not growth hacker.
- Owned vocabulary: *echo*, *signal*, *listening*, *fold*, *wave*. Use deliberately, never as filler.
- Verbs over adjectives. *"Hear every echo of your brand"* beats *"Powerful AI-driven monitoring."*

### Brand components (`components/brand/`)
| Component | Use when |
|---|---|
| `<EchofoldLogo />` | Anywhere you'd put a logo glyph. Variants: `mono` / `duo`. Sizes: `sm` / `md` / `lg`. |
| `<EchofoldMark />` | Logo + wordmark lockup (sidebar, hero, marketing). |
| `<EchofoldEmptyState />` | **Every** empty state. Replaces ad-hoc *"No data" / "📭 nothing here"* divs. Takes `icon`, `badge`, `title`, `description`, optional `action`. |
| `<EchofoldSpinner />` | **Every** loading indicator that takes more than ~300ms or covers ≥30% of the viewport. Replaces `animate-spin border-t-purple-600` rings and `animate-pulse` skeleton blocks. |

When you find a generic spinner / skeleton / empty state in code you're touching, replace it with the brand component instead of preserving it.

### Brand tokens (declared in `app/globals.css` `@theme`)
| Token | Tailwind | Use for |
|---|---|---|
| Primary purple | `bg-purple-500/600/700` (existing scale) | Primary actions, brand surfaces, gradients to indigo |
| Indigo accent | `bg-indigo-500/600` | Gradient pairing with purple on the brand pill |
| Signal cyan | `var(--ef-signal)` / `bg-cyan-400` | Live/listening indicators ONLY. Not for general UI. |
| Sentiment | `text-emerald-300` / `text-rose-300` / `text-slate-300` | Positive / negative / neutral chips |
| Alert | `text-amber-300` | Warning states, alert spikes |
| Surfaces | `bg-white dark:bg-dk-surface`, `bg-slate-50 dark:bg-dk-bg`, `border-slate-200 dark:border-dk-border` | All chrome — use these tokens, not hardcoded hex |

### Motion primitives
- `.ef-echo-pulse` — concentric expanding cyan rings. Used for:
  - Live data indicators ("Listening", "x platforms connected")
  - The brand mark on hero / auth pages
  - Live counters
  - **Not** for general loading spinners — use `<EchofoldSpinner />` for that.
- Standard ease: `cubic-bezier(0.2, 0.8, 0.2, 1)` (`var(--ef-ease-out)`)
- Standard durations: `--ef-duration-fast: 150ms`, `--ef-duration-base: 220ms`
- All infinite animations must be disabled under `@media (prefers-reduced-motion: reduce)` — `.ef-echo-pulse` already handles this.

### Typography
| Class | Family | Use for |
|---|---|---|
| `font-sans` (default) | Inter | All body, UI, labels. Don't override unless using a display or mono. |
| `font-display` | Manrope (700 / 800) | Landing headlines (`<h1>`, `<h2>` on `/`, `/login`), plan prices, hero numbers. **Never** use on dashboard headers — display fonts at small sizes look amateurish. |
| `font-mono tabular-nums` | JetBrains Mono | Stat counters, IDs, timestamps, step markers. Always pair with `tabular-nums` so digits don't jitter on update. |

Headline tracking: `tracking-[-0.02em]` to `tracking-[-0.025em]` on display headlines. Eyebrow labels: uppercase + `tracking-[0.16em]`.

### Light theme
The app supports light + dark via the `dark:` Tailwind variant.
- Default page bg: `bg-slate-50 dark:bg-dk-bg`
- Default surface: `bg-white dark:bg-dk-surface`
- Default border: `border-slate-200 dark:border-dk-border`
- **Never** use `bg-white/6` or `text-white/40` style alpha-on-white classes without a `dark:` prefix or a light-mode counterpart (e.g. `bg-slate-100 dark:bg-white/6`). These break light theme.
- **Never** hardcode dark-only inline styles (e.g. `style={{ background: '#15151d' }}`) on shared chrome. The Sidebar's gradient is the one allowed exception, and it's gated behind `dark:`.

### Marketing surfaces (always-dark, by design)
The landing page (`/`) and login page (`/login`) are intentionally dark across themes. New marketing surfaces (pricing, blog, docs) should follow the same convention. Everything else respects the user's theme.

### Don'ts
- Don't add a new "Coming Soon" placeholder by hand — use `<EchofoldEmptyState badge="Coming Soon" ... />`.
- Don't write `<div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />`. Use `<EchofoldSpinner />`.
- Don't introduce additional fonts. The three-font system is intentional.
- Don't use `font-display` on items smaller than `text-2xl`.
- Don't write `text-white` without a light-theme counterpart on shared dashboard chrome.
- Don't put non-cyan colors inside `.ef-echo-pulse`. Cyan is the "echo signal" color.

---

## Architecture — Multi-Tenant Organization Model

## Architecture — Multi-Tenant Organization Model

### Entity Hierarchy

```
SUPER (internal app admin)
└── Organization  (the marketing agency)
      ├── ORG_ADMIN users  → see all brands, manage users, create brands
      └── Brands
            └── NORMAL users  → see only brands they are invited to
```

### User Roles & What They See

| Role | Brand Switcher | Can manage users? | Can create brands? |
|---|---|---|---|
| `SUPER` | All orgs/brands | Yes (everything) | Yes |
| `ORG_ADMIN` | All brands in their org | Yes (within org) | Yes (up to subscription limit) |
| `NORMAL` | Only invited brands | No | No |

### Auth State (`BrandAuthContext`)

The JWT embeds `org_id`, `brand_id`, and `role`. After login:
- `ORG_ADMIN` or `NORMAL` with one brand → JWT issued, redirect to dashboard
- Any user with multiple brands → brand selection screen shown first

### Brand Switcher

- Fetched from `GET /auth/my-brands` after login — returns only brands the user can access
- ORG_ADMIN gets all org brands; NORMAL gets only their invited brands
- Selecting a brand calls `POST /auth/switch-brand` → new JWT → page refresh with new brand context

### Registration

`POST /auth/register` — takes `org_name`, `name`, `email`, `password`.
Creates an Organization + first ORG_ADMIN. No brand is created at signup.
After registration, admin is prompted to create their first brand.

### Route Guards

- All `/(dashboard)/*` routes require a valid JWT with a `brand_id`.
- If `brand_id` is null (no brand created yet), redirect to a "Create your first brand" page.
- Brand-specific API calls are rejected 403 by the backend if the user doesn't have access — handle with a redirect to `/unauthorized`.

---

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

## No Mock Data

**Never add mock, stub, hardcoded, or placeholder data under any circumstances.** This includes:
- Hardcoded arrays or objects standing in for API responses
- `TODO: replace with real data` comments with fake values
- Conditional mock branches (e.g. `if (dev) return mockData`)
- Fake `setTimeout`-based loading simulations

All data must come from real API calls. If an endpoint does not exist yet, leave the UI in a loading or empty state and wait for the real endpoint.

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
