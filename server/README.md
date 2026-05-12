# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

Admin panel:

- Set `ADMIN_EMAILS` in `server/.env` to a comma-separated allowlist.
- Admin UI is at `http://localhost:5173/admin` (after signing in).

This project was created using `bun init` in bun v1.3.12. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
