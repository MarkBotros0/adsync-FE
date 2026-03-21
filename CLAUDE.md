# Frontend (ad-sync-fe) — Claude Notes

## Responsive Design

The design must be **100% responsive**. All features must be fully available and functional on:

- **Desktop** (1024px and above)
- **Tablet** (768px – 1023px)
- **Mobile** (below 768px)

No feature should be hidden, disabled, or degraded on any breakpoint. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) to adapt layouts rather than removing functionality.

## TypeScript

- Always define explicit types for props, function parameters, and return values.
- **Never use `any`**. Use `unknown`, proper interfaces, or generics instead.
- Prefer `interface` for object shapes and `type` for unions/intersections.
- **All shared types must live in `types/`** — never define a type inline if it is used in more than one place. Import from `types/` instead of redefining.

## Code Quality

- **No code duplication** — extract shared logic into reusable hooks (`hooks/`), utilities (`lib/`), or components (`components/`).
- **Always reuse existing components** — before creating a new component, check `components/` first. Extend or compose existing ones rather than building from scratch.
- Follow Next.js best practices:
  - Use Server Components by default; add `"use client"` only when necessary (event handlers, browser APIs, hooks).
  - Fetch data in Server Components or Route Handlers, not in client components.
  - Use the App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
  - Prefer `next/image` over `<img>` and `next/link` over `<a>` for internal navigation.
  - Keep route segments focused — one page, one responsibility.
