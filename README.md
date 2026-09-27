# LinkedPosts

A LinkedIn-style social feed app built with React — users can create posts, comment, like, and manage their profile, with a fully responsive UI and dark mode support.

**Live Demo:** [https://linked-posts-social-app-one.vercel.app/]
**Repository:** [https://github.com/Mohanad179/Linked-Posts-Social-App]

---

## Features

- **Authentication** — login/signup with protected routing, so unauthenticated users can't access the app's core pages
- **Posts feed** — fetch and display posts with real-time updates after creating/deleting content
- **Comments** — create and delete comments on posts, with like counts and relative timestamps ("2 hours ago")
- **User profiles** — view other users' profiles via a modal, triggered from avatars across the app
- **Dark mode** — persisted across sessions via `localStorage`, class-based toggle
- **Form validation** — React Hook Form + Zod schema validation, including cross-field checks (e.g. password confirmation) and reusable error components
- **Responsive design** — mobile-first layout using Tailwind CSS, tested down to small screens
- **Toast notifications** — user feedback on every create/update/delete action (success and error states)

---

## Tech Stack

| Category | Tools |
|---|---|
| Framework | React, Vite |
| Routing | React Router |
| Forms & Validation | React Hook Form, Zod |
| Data Fetching | Axios, TanStack React Query |
| Styling | Tailwind CSS v4, Flowbite React, HeroUI |
| Notifications | React Hot Toast |
| Icons | React Icons, FontAwesome |
| SEO | React Helmet |
| Deployment | Vercel |

---

## Architecture Notes

A few patterns I intentionally built in, rather than bolted on:

- **Auth context** — global auth state managed via Context API, with lazy `useState` initialization (reads `localStorage` once on mount instead of on every render) and controlled `login()`/`logout()` functions rather than exposing a raw `setToken` — this keeps token mutation logic centralized and predictable.
- **Protected routes** — a dedicated `ProtectedRoutes` wrapper redirects unauthenticated users, rather than scattering auth checks across individual pages.
- **Server state with React Query** — mutations (create/delete comment, etc.) invalidate the relevant queries on success, so the UI reflects changes without manual refetch logic.
- **Form validation via schema, not inline rules** — Zod schemas define validation once (including cross-field rules like matching passwords via `.refine()`), keeping form components focused on UI rather than validation logic.

---

## Problems I Debugged Along the Way

Worth documenting because these were real bugs, not hypotheticals:

- **Layout bugs that looked like component bugs** — a footer stuck to page content instead of the viewport bottom, traced back to a missing `min-h-screen flex flex-col` wrapper (a React Fragment can't hold layout classes).
- **Silent async bugs** — a missing `await` on an `axios.post()` call caused a mutation to resolve before the request actually completed.
- **Wrong error path** — mismatched `error.response.data.message` access caused error toasts to silently fail.
- **Stale UI state** — simultaneous success/error messages appearing together, fixed by resetting both states to `null` before every new form submission.
- **`mutationFn` referencing the wrong variable** — a delete mutation used the full comments array instead of the specific comment's ID, silently deleting nothing; fixed by passing the ID as a mutation variable.
- **`axios.delete` signature error** — auth headers were placed in an ignored third argument; `axios.delete` only accepts `(url, config)`.

---

## Getting Started

```bash
# Clone the repo
git clone [your-repo-url]
cd linkedposts

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
npm run preview
```

---

## Screenshots

[Add 2–3 screenshots here — feed, comments section, and dark mode are good picks]

---

## Author

**Mohanad** — Frontend Development Intern, final-year Computer Science student
[GitHub](https://github.com/Mohanad179) · [LinkedIn](https://linkedin.com/in/mohanad-abdelghafar)
