# Custom Domain Setup Guide

## 🌐 Remove .web.app and Use Custom Domain

### Option 1: Your Own Domain (Recommended)

#### Step 1: Purchase a Domain
Popular domain registrars:
- [Google Domains](https://domains.google) - $12/year
- [Namecheap](https://namecheap.com) - $10-15/year
- [Cloudflare](https://cloudflare.com) - $8-12/year
- [GoDaddy](https://godaddy.com) - $10-15/year

Suggested domain names:
- `quantumflashcards.com`
- `quantum-flashcards.com`
- `quantumcards.com`
- `quantumstudy.com`

#### Step 2: Add Custom Domain in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Hosting → Custom domains
4. Click "Add custom domain"
5. Enter your domain (e.g., `quantumflashcards.com`)
6. Click "Continue"

#### Step 3: Configure DNS Records
Firebase will provide you with DNS records to add:

**For A record:**
```
Type: A
Name: @
Value: 151.101.1.195
```

**For CNAME record:**
```
Type: CNAME
Name: www
Value: quantumflashcards.com
```

**For TXT record (verification):**
```
Type: TXT
Name: @
Value: [Firebase will provide this]
```

#### Step 4: Wait for DNS Propagation
- DNS changes can take 24-48 hours to propagate
- Firebase will automatically detect when DNS is configured
- Your site will be live at `https://quantumflashcards.com`

### Option 2: Firebase Custom Subdomain

If you don't want to purchase a domain, you can use:
- `quantum-flashcards.firebaseapp.com`

This is free and doesn't require domain purchase.

### Option 3: Subdomain of Existing Domain

If you already own a domain, create a subdomain:
- `quantum.yourdomain.com`
- `flashcards.yourdomain.com`

## 🎯 Benefits of Custom Domain:

1. **Professional appearance** - No `.web.app` in URL
2. **Better branding** - Matches your app name
3. **SEO benefits** - Custom domains rank better
4. **SSL included** - Automatic HTTPS certificate
5. **Global CDN** - Fast loading worldwide

## 💰 Cost Breakdown:

- **Firebase Hosting**: Free (up to 10GB storage)
- **Custom Domain**: $8-15/year
- **SSL Certificate**: Free (included with Firebase)
- **CDN**: Free (included with Firebase)

## 🚀 Quick Start:

1. Purchase domain (e.g., `quantumflashcards.com`)
2. Add custom domain in Firebase Console
3. Configure DNS records
4. Wait 24-48 hours for propagation
5. Your site will be live at `https://quantumflashcards.com`

## 📝 Example DNS Configuration:

For domain `quantumflashcards.com`:

```
A Record:
Name: @
Value: 151.101.1.195

CNAME Record:
Name: www
Value: quantumflashcards.com

TXT Record:
Name: @
Value: [Firebase verification code]
```

Your site will be accessible at:
- `https://quantumflashcards.com`
- `https://www.quantumflashcards.com` 