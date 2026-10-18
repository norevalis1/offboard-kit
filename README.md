# Offboard Kit

A free IT onboarding and offboarding checklist generator. Pick "new hire" or "employee leaving", tick the systems your company uses, and get a complete, ordered checklist you can work through, print, download as Markdown or copy into a ticket.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser to run it. Everything runs in the browser; progress is saved to `localStorage` on the user's device only.

- `data.js`: the checklist steps for each system (edit this to add or change steps)
- `app.js`: builder logic, progress tracking, export, theme toggle and page animations
- `style.css`: design tokens, light/dark themes, responsive layout, print layout

## Hosting

Any static host works. GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## Planned

- Pro tier: saved company templates, custom steps, Excel and ticket exports
- Per-setup landing pages for search (e.g. "Microsoft 365 offboarding checklist")
