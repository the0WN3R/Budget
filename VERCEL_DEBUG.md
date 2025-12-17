# Vercel Debugging Guide

Since your app works on `localhost:3000` but not on Vercel, let's diagnose the issue.

## Step 1: Test the Debug Endpoint

After Vercel redeploys, visit:
```
https://ownersbudget.vercel.app/api/debug
```

This will show you:
- What method requests are being sent as
- What environment variables are available
- Request headers and details

## Step 2: Test Login Endpoint Directly

Open your browser console on the Vercel site and run:

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Check the browser Network tab to see:
- What method is actually being sent
- What response you get
- Any redirects happening

## Step 3: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → **Functions** tab
3. Click `api/auth/login`
4. Try logging in, then check the logs

You should see logs starting with `[LOGIN API]` showing what method was received.

## Common Vercel Issues

### Issue 1: API Routes Not Deployed
- Check that `pages/api/auth/login.js` exists in your repo
- Verify it's included in the git push
- Make sure there are no build errors

### Issue 2: Environment Variables Not Applied
- Even if set, they only apply after a new deployment
- Make sure you **redeployed** after adding env vars
- Check the debug endpoint to see if env vars are available

### Issue 3: Method Mismatch
- Vercel might be converting POST to GET somehow
- Check the debug endpoint to see actual method received
- Check browser Network tab for actual request sent

## Next Steps

1. Visit `/api/debug` on Vercel - this will confirm API routes work
2. Check browser console when trying to login
3. Share the results from the debug endpoint

This will help us pinpoint exactly what's different between localhost and Vercel.

