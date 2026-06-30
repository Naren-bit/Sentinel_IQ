# SentinelIQ Deployment Guide

## Architecture

```
[Vercel - Frontend]  ←→  [Render - Backend]  ←→  [Google Gemini API]
   Next.js app              Express server          PII detection
```

---

## Step 1: Deploy Backend on Render

1. **Go to** [render.com](https://render.com) and sign in with your GitHub account.

2. **Click** "New +" → "Web Service".

3. **Connect your repo**: Select `Naren-bit/Sentinel_IQ`.

4. **Configure the service**:
   | Setting | Value |
   |---|---|
   | **Name** | `sentineliq-backend` |
   | **Region** | Oregon (US West) |
   | **Branch** | `main` |
   | **Root Directory** | *(leave empty — it's the repo root)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node backend/server.js` |
   | **Plan** | Free |

5. **Add Environment Variables** (under "Environment"):
   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | *(paste your Gemini API key)* |
   | `NODE_ENV` | `production` |

6. **Click** "Deploy Web Service" and wait for the build to complete.

7. **Copy your backend URL** — it will look like:
   ```
   https://sentineliq-backend.onrender.com
   ```

> [!IMPORTANT]
> After deploying the frontend (Step 2), come back here and add one more env var:
> `FRONTEND_URL` = `https://your-app.vercel.app`

---

## Step 2: Deploy Frontend on Vercel

1. **Go to** [vercel.com](https://vercel.com) and sign in with your GitHub account.

2. **Click** "Add New..." → "Project".

3. **Import your repo**: Select `Naren-bit/Sentinel_IQ`.

4. **Configure the project**:
   | Setting | Value |
   |---|---|
   | **Framework Preset** | Next.js *(auto-detected)* |
   | **Root Directory** | `frontend-next` ← **IMPORTANT: Click "Edit" and set this!** |
   | **Build Command** | *(leave default: `next build`)* |
   | **Output Directory** | *(leave default)* |

5. **Add Environment Variable**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://sentineliq-backend.onrender.com` ← *(your Render URL from Step 1)* |

6. **Click** "Deploy" and wait for the build.

7. **Your live URL** will look like:
   ```
   https://sentinel-iq.vercel.app
   ```

---

## Step 3: Connect Them Together

After both are deployed:

1. **Go back to Render** → Your `sentineliq-backend` service → "Environment".
2. **Add/Update** the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://sentinel-iq.vercel.app
   ```
   *(Use the actual URL Vercel gave you)*
3. Render will auto-redeploy with the updated CORS settings.

---

## Verify the Deployment

1. Open your Vercel frontend URL in a browser.
2. Click "Try Sample Document" — this uses MockProvider (no API key needed).
3. Upload a PDF — this sends it to Gemini via your Render backend.
4. Check Render logs if anything fails (Dashboard → Logs).

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Frontend shows "Network Error" | Check that `NEXT_PUBLIC_API_URL` on Vercel matches your Render URL exactly (no trailing slash) |
| CORS error in browser console | Ensure `FRONTEND_URL` env var on Render matches your Vercel URL |
| "Gemini timed out" | Render free tier can cold-start slowly. Try again — second request will be faster |
| Build fails on Vercel | Make sure Root Directory is set to `frontend-next` |
| Build fails on Render | Root Directory should be empty (repo root), not `backend` |

> [!NOTE]
> Render free tier services spin down after 15 minutes of inactivity. The first request after idle may take 30-60 seconds to cold-start.
