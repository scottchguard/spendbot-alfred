# Google OAuth Branding Verification - Steps for Scott

## Issue
Google's OAuth consent screen shows the Supabase URL instead of "SpendBot" because we haven't verified domain ownership.

## What I've Fixed (Ready to Deploy)
1. ✅ **Public landing page** - App now shows a marketing page before auth
2. ✅ **Privacy policy** - Accessible from landing page footer
3. ⏳ **Domain verification** - Needs your action (below)

## Domain Verification Steps

### Option A: DNS TXT Record via GoDaddy (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property → Enter `spendbot.app`
3. Choose "Domain" verification method
4. Google will give you a TXT record like:
   ```
   google-site-verification=XXXXXXXXXXXXX
   ```
5. **Add to GoDaddy:**
   - Log into [GoDaddy](https://dcc.godaddy.com/)
   - Go to My Products → DNS for spendbot.app
   - Click "Add" under Records
   - Type: **TXT**
   - Name: **@** (or leave blank)
   - Value: paste the google-site-verification string
   - TTL: 1 Hour (or default)
   - Save
6. Wait 5-10 minutes, then click "Verify" in Search Console

### Option B: HTML Meta Tag
1. Go to Google Search Console
2. Choose "URL prefix" method with `https://spendbot.app`
3. Select "HTML tag" verification
4. Copy the meta tag they provide
5. Let me know and I'll add it to the app's index.html

## After Domain Verification
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → OAuth consent screen
3. Click "Edit App"
4. Under "Authorized domains", add `spendbot.app`
5. Submit for verification

## Timeline
- DNS verification: Usually instant to 24 hours
- Google OAuth verification: Can take 1-2 weeks for review

## Questions?
Just ping me and I'll help troubleshoot!
