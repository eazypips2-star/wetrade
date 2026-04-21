# WeTrade — Complete Deployment Guide
## From zero to live app in under 1 hour

---

## WHAT YOU NEED BEFORE YOU START
- A computer with internet access
- An email address (to create accounts)
- About 45–60 minutes

You will create 3 free accounts: GitHub, Supabase, and Netlify.
No credit card required for any of them.

---

## STEP 1 — Create a GitHub Account & Upload the Code

GitHub is where your code lives. Think of it like Google Drive, but for code.

**1.1** Go to https://github.com and click "Sign up"
- Enter your email, create a password, pick a username
- Verify your email when they send you a confirmation

**1.2** Once logged in, click the green "New" button (top left)

**1.3** Fill in the form:
- Repository name: `wetrade`
- Set it to **Private** (so only you can see it)
- Click "Create repository"

**1.4** On the next page, click "uploading an existing file"

**1.5** Upload ALL the files from the `wetrade` folder I gave you.
   - You need to maintain the folder structure
   - Easiest method: drag the entire `wetrade` folder contents into the GitHub page
   - IMPORTANT: Upload files inside each folder too (src/pages/, src/components/, etc.)

**1.6** Click "Commit changes" (green button at the bottom)

✅ Your code is now on GitHub.

---

## STEP 2 — Set Up Supabase (Database + Login System)

Supabase is your database and handles trader login/registration. Free up to 50,000 users.

**2.1** Go to https://supabase.com and click "Start your project"
- Sign up with your GitHub account (easiest) or email

**2.2** Click "New Project"
- Organization: your name or "WeTrade"
- Project name: `wetrade`
- Database password: Create a strong password and SAVE IT somewhere safe
- Region: Pick the one closest to your traders (e.g. "US East" for USA)
- Click "Create new project" — wait about 2 minutes

**2.3** Get your API Keys
- In your project dashboard, click "Settings" (gear icon, left sidebar)
- Click "API"
- You will see two things you need:
  - **Project URL** — looks like: `https://abcdefghijkl.supabase.co`
  - **anon public key** — a long string starting with `eyJ...`
- Copy both of these somewhere (Notepad, Notes app) — you'll need them in Step 4

**2.4** Set up the database tables
- In the left sidebar, click "SQL Editor"
- Click "New query"
- Open the file `supabase_schema.sql` from the wetrade folder
- Copy ALL the text inside it
- Paste it into the SQL Editor box
- Click the green "Run" button
- You should see "Success. No rows returned" — that's correct!

✅ Your database is ready. Traders can now register and their data is secure.

---

## STEP 3 — Set Up Netlify (Hosting)

Netlify takes your code from GitHub and turns it into a live website. Free forever for your use case.

**3.1** Go to https://netlify.com and click "Sign up"
- Sign up with your GitHub account (recommended — makes next steps easier)

**3.2** After login, click "Add new site" → "Import an existing project"

**3.3** Click "GitHub"
- Authorize Netlify to access your GitHub (click "Authorize")
- You'll see a list of your repositories — click `wetrade`

**3.4** Configure the build settings:
- Branch to deploy: `main`
- Base directory: (leave empty)
- Build command: `npm run build`
- Publish directory: `dist`
- Click "Deploy site"

**3.5** Wait about 2-3 minutes. Netlify will build your app.
You'll see it go from "Building" → "Published"

**3.6** You'll get a random URL like `amazing-tesla-abc123.netlify.app`
- You can change this! Click "Site settings" → "Domain management" → "Options" → "Edit site name"
- Change it to something like `wetrade-prep` → your URL becomes `wetrade-prep.netlify.app`

✅ Your app is live! But it won't work yet until you add your Supabase keys in Step 4.

---

## STEP 4 — Connect Supabase to Netlify (Environment Variables)

This is like giving your app the password to talk to your database.

**4.1** In Netlify, go to your site → "Site settings" → "Environment variables"

**4.2** Click "Add a variable" and add these one by one:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 2.3 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key from Step 2.3 |

**4.3** After adding both, go back to your site overview
- Click "Deploys" tab
- Click "Trigger deploy" → "Deploy site"
- Wait 2 minutes for it to rebuild

✅ Your app is now fully connected to the database!

---

## STEP 5 — Configure Supabase Email (So Traders Can Register)

By default, Supabase sends a confirmation email when traders register.

**5.1** In Supabase, go to "Authentication" → "Email Templates"
- The default templates work fine
- Traders will get a "Confirm your email" email when they register

**5.2** Optional — disable email confirmation for internal use:
- Go to "Authentication" → "Providers" → "Email"
- Toggle OFF "Enable email confirmations"
- This means traders can log in immediately after registering (recommended for internal firm use)

**5.3** To invite traders, just share your Netlify URL with them
- They go to the URL, click "Register", enter their name, email, and password
- They're in immediately

---

## STEP 6 — Test Everything

**6.1** Open your Netlify URL in your browser
**6.2** Click "Register" and create your first trader account
**6.3** Log in and explore:
- Market Overview — should show the dashboard
- Daily Plan — write a test plan and click Save
- Watchlist — add a test ticker
- Strategy Sheet — create a test strategy
- Team Feed — share something and check it appears

**6.4** Open a different browser (or incognito window), register a second trader
- Share something from trader 1, check it appears in trader 2's Team Feed

✅ Everything working? You're live!

---

## ADDING LIVE MARKET NEWS (Optional — Free)

To show real news on the dashboard:

**6.1** Go to https://www.marketaux.com → Sign up for free
- Free tier: 100 API calls/day (enough for a small team)

**6.2** Copy your API token from the dashboard

**6.3** In Netlify → Site settings → Environment variables, add:
| Key | Value |
|-----|-------|
| `VITE_MARKETAUX_KEY` | Your Marketaux API token |

**6.4** Redeploy the site (Deploys → Trigger deploy)

---

## YOUR FINAL APP URLS

- **Live app**: `https://your-site-name.netlify.app`
- **Supabase dashboard**: `https://supabase.com/dashboard`
- **Netlify dashboard**: `https://app.netlify.com`

Share the live app URL with your traders. That's all they need.

---

## TROUBLESHOOTING

**"Site not found" or blank page**
→ Check that your build command is `npm run build` and publish directory is `dist` in Netlify

**Traders can't log in**
→ Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly in Netlify environment variables. Redeploy after adding them.

**"Database error" when saving**
→ Go to Supabase SQL Editor and re-run the schema SQL from Step 2.4

**Changes not showing after code update**
→ In Netlify → Deploys → Trigger deploy

---

## GETTING FUTURE UPDATES

When I build new features for you:
1. Download the new files I provide
2. Go to your GitHub repo → find the file → click the pencil icon to edit it
3. Paste the new code → "Commit changes"
4. Netlify will automatically rebuild and deploy within 2-3 minutes

---

*WeTrade Pre-Market Prep Platform — Built for professional day traders*
