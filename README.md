# Daniel Ayegba Portfolio

Animated, responsive portfolio website with:
- Multi-page navigation
- Touch/click ripple interactions
- Dark/light theme
- Downloadable CV
- StreamFlix project gallery + live button
- SolarPulse project gallery + live button
- Review form + local review wall
- Node/Express backend for email-backed reviews

## Local Termux setup

```bash
pkg update && pkg upgrade -y
pkg install nodejs unzip git -y
cd ~/portfolio
npm install
cp .env.example .env
nano .env
npm start
```

Open `http://127.0.0.1:8080`.

Use a Gmail App Password in `.env`, never your normal Gmail password.

## GitHub upload from Termux

GitHub Pages can host the static front end, but it cannot run `server.js` or Node/Nodemailer. Keep the repository for source/version control and deploy the full Node app to a Node-capable host (such as Render) if you want the email review backend to work.

```bash
cd ~/portfolio
git init
git branch -M main
git add .
git commit -m "Add portfolio with StreamFlix and SolarPulse projects"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Do **not** commit `.env` or real passwords/API keys. `.gitignore` excludes `.env` and `reviews.json`.

## Live projects

- StreamFlix: https://deni-is-anonymous.github.io/streamflix/
- SolarPulse: https://solarpulse-solar-company.onrender.com
