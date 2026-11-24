# CallFlow — 311 Learning Lab

**Learn the flow. Build the habit.**

An independent, Typeform-inspired customer-service documentation training prototype created as a portfolio concept. **Not affiliated with or endorsed by the City of Toronto.**

## Try the app

Open `index.html` after deployment. The companion guide catalogue is at `/guide-review.html`.

CallFlow helps new service representatives develop clarity and documentation habits through a guided call experience:

- Gather contact information; the client's name stays visible throughout the call.
- Enter a reason for contact and additional details.
- Receive **up to two** context-aware probing suggestions, linked to reviewed 311 service resources.
- Choose whether an issue was resolved, requires more time, or needs escalation.
- Record mandatory resolution comments, review call timestamps, and copy CRM-ready notes.
- Use **Start new call** to reset the entire form.

Includes **20 reviewed, site-informed training guides** selected using City of Toronto 2025 311 key metrics, with adjustments for the 2026 residential recycling transition. Questions are proposed training prompts, not official City scripts.

## Deploy on Vercel

1. In [Vercel](https://vercel.com/new), import **SZN4Design/callflow-311-learning-lab**.
2. Framework Preset: **Other**.
3. Root Directory: `./`.
4. Leave Build Command and Output Directory empty. The app uses a static `index.html`.
5. Deploy, then open the URL Vercel gives you.

The live site will be hosted by Vercel; this GitHub repository does **not** deploy itself.

## Important limits

- **No active AI** in this standalone build. Question suggestions use reviewed, locally stored information and rules-based matching.
- **No live City website scraping or scheduled monitoring** is enabled. Do not turn on automated collection without confirming permission.
- Use **fictional information only** for testing. Do not enter real residents' names, contact details, or case information.
- The City's links are for reference. Always verify current information before relying on it operationally.
- The app does not connect to any CRM; it generates copyable text.

## Project source

This repository publishes a **self-contained preview** for straightforward Vercel deployment. The original modular development package, including the optional AI endpoint, tests and permission-gated source-review scripts, is kept separately and can be uploaded for further development.
