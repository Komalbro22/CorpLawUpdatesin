# Vercel Deployment Steps

1. Push code to GitHub main branch
2. Go to vercel.com → New Project → Import your GitHub repo
3. Framework: Next.js (auto-detected)
4. Add ALL environment variables listed above
5. Click Deploy
6. After deploy: go to Project Settings → Domains
7. Add: corplawupdates.in and www.corplawupdates.in
8. Update DNS at your registrar:
   Type A → 76.76.21.21 (Vercel IP)
   Type CNAME → cname.vercel-dns.com (for www)
9. Wait 24-48 hours for DNS propagation
10. Verify SSL certificate is issued automatically by Vercel

## Post-deployment verification checklist

After DNS propagates, verify:
□ https://www.corplawupdates.in loads correctly
□ https://www.corplawupdates.in/sitemap.xml returns XML
□ https://www.corplawupdates.in/robots.txt returns correct rules
□ https://www.corplawupdates.in/admin/login works
□ https://www.corplawupdates.in/api/og?title=Test&category=MCA returns image
□ SSL certificate is valid (green padlock)
□ No mixed content warnings in browser console
□ Subscribe form works end to end
□ Admin can create and publish article
□ Article appears on homepage after publish
