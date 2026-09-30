# AGENT WORKSPACE RULES & EFFICIENCY INSTRUCTIONS

## Project Architecture Overview
- `/src/`: Express REST API Backend (CommonJS, MySQL2, Auth Middleware).
- `/client/`: React 19 + Vite Frontend (Hooks, Vanilla CSS, Lucide Icons, Axios).
- `/public/`: Compiled static bundle output (`vite build` output) and PWA assets.

## Execution Rules for Agent
1. **Targeted File Editing**: Focus exclusively on files explicitly mentioned in the prompt (`@file`) or open in active editor tabs. Do not perform wide directory searches unless explicitly requested.
2. **Minimal & Pointed Code Changes**: Provide edits ONLY for modified lines/blocks. Avoid rewriting entire large files for small fixes.
3. **Build Maintenance**: When UI components in `/client/src/` are modified and ready for deployment, compile production assets via `npm run build` inside `/client/`.
