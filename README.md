# Arjun Mehta Portfolio

A concept portfolio website for a fine-art wedding photographer: a long-scroll static site with a commission form that posts to a small FastAPI inquiry API. The server also serves the static site.

**Demo:** [arjun-mehta-zeta.vercel.app](https://arjun-mehta-zeta.vercel.app)
**Stack:** HTML, CSS and vanilla JavaScript with GSAP (jsDelivr); Google Fonts (Fraunces, Inter); Python 3 with FastAPI, Uvicorn and Pydantic; Vercel serverless handler in `api/`

## What it does

- Single page with sections for the hero, manifesto, promise, vows, realms, signature, portfolio mosaic, experience, about and contact.
- Portfolio mosaic tiles open a lightbox.
- Commission form validates input with Pydantic (name, email, date, venue, package, message) and posts to `/api/inquiry`.
- Each inquiry is saved to `data/inquiries.json` (git-ignored). If SMTP settings are present, an email notification is sent.
- GSAP scroll animations. They are skipped when the visitor prefers reduced motion.

## Quick start

```bash
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8080 --reload
```

Open [localhost:8080](http://localhost:8080/). On Windows, `start.ps1` runs the same two commands from its own folder.

Email notifications are optional. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `NOTIFY_EMAIL` in the environment. Without them, inquiries are still saved.

## How it works

```
browser ──► index.html + animations.js ──► POST /api/inquiry
                                               │
                            server.py: validate → data/inquiries.json
                                               └► SMTP email (if configured)
```

`server.py` runs the API at `/api/*` and mounts the project folder as static files at `/`. Requests for `/data` and `/server.py` return 404.

## Project structure

- `index.html`, `styles.css`, `styles-patch.css`: the page and its styles
- `animations.js`, `animations-patch.js`: scroll animations, lightbox, form
- `server.py`: FastAPI app, inquiry endpoint, static files
- `api/inquiry.py`: optional Vercel serverless inquiry handler
- `images/`: 99 image files for the page
- `requirements.txt`: Python dependencies

## Roadmap

- Working locally: static pages, animations, lightbox, commission form, inquiry storage.
- Email notifications need SMTP settings. The Vercel handler is a separate deploy path.
- `server.py` writes inquiries to a file. Use a database before relying on it in production.
- The page loads a patch stylesheet and a patch script next to the main files. Merging them into the main files would simplify the code.
- No automated tests.

---
Built by [Rhudhresh R](https://github.com/RHUDHRESH)
