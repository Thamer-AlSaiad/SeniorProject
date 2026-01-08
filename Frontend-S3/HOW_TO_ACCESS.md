# How to Access Different Portals

## Local Development (Current Setup)

Since you're running locally, you can access all portals using **path-based routing**:

### 🏥 Patient Portal
```
http://localhost:5173/login          → Patient login
http://localhost:5173/signup         → Create patient account
http://localhost:5173/profile        → Patient profile
http://localhost:5173/edit-profile   → Edit patient profile
```

### 👨‍⚕️ Clinician/Doctor Portal
```
http://localhost:5173/doctor/login         → Doctor login
http://localhost:5173/doctor/profile       → Doctor profile
http://localhost:5173/doctor/edit-profile  → Edit doctor profile
```

### 🔐 Admin Portal
```
http://localhost:5173/admin/login    → Admin login
```

### ❌ 404 Page
```
http://localhost:5173/invalid-route  → Will show 404 page
```

---

## Testing Right Now

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open these URLs in your browser:**
   - Patient: `http://localhost:5173/login`
   - Doctor: `http://localhost:5173/doctor/login`
   - Admin: `http://localhost:5173/admin/login`
   - 404: `http://localhost:5173/random-page`

---

## Production with Subdomains (After Deployment)

When deployed to production, you can use actual subdomains:

### Main Domain (Patients)
```
https://yourwebsite.com/login
https://yourwebsite.com/profile
```

### Clinician Subdomain
```
https://clinician.yourwebsite.com/doctor/login
https://clinician.yourwebsite.com/doctor/profile
```

### Admin Subdomain
```
https://admin.yourwebsite.com/admin/login
```

---

## Testing Subdomains Locally (Optional)

If you want to test with actual subdomains on your local machine:

### Windows
1. Open Notepad as Administrator
2. Edit: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines:
   ```
   127.0.0.1 myapp.local
   127.0.0.1 clinician.myapp.local
   127.0.0.1 admin.myapp.local
   ```
4. Save and restart browser

### Mac/Linux
1. Open terminal
2. Edit: `sudo nano /etc/hosts`
3. Add these lines:
   ```
   127.0.0.1 myapp.local
   127.0.0.1 clinician.myapp.local
   127.0.0.1 admin.myapp.local
   ```
4. Save (Ctrl+X, Y, Enter)

Then access:
- `http://myapp.local:5173/login`
- `http://clinician.myapp.local:5173/doctor/login`
- `http://admin.myapp.local:5173/admin/login`

---

## Quick Test Checklist

✅ Patient login: `http://localhost:5173/login`
✅ Doctor login: `http://localhost:5173/doctor/login`
✅ Admin login: `http://localhost:5173/admin/login`
✅ 404 page: `http://localhost:5173/invalid-page`
✅ Patient profile: `http://localhost:5173/profile` (after login)
✅ Doctor profile: `http://localhost:5173/doctor/profile` (after login)
