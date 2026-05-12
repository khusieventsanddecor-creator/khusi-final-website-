# Khusi Events & Decor

A lightweight static website for Khusi Events & Decor, built for deployment on Vercel through a GitHub repository.

## Local preview

Run a local static server from the project folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy on Vercel with GitHub

1. Create a new GitHub repository and push these files.
2. In Vercel, choose **Add New Project** and import the GitHub repository.
3. Keep the framework preset as **Other**.
4. Leave the build command and output directory empty.
5. Deploy.

## Before launch

- Current email: `admin@khusi.com.au`.
- Current phone: `+61 481 509 470`.
- Add real Khusi Events & Decor gallery photos when available.
- Replace `assets/khusi-logo.png` if the logo changes.
- Update the social links if the Facebook, Instagram, TikTok, or website URLs change.
- Update the operating area if Khusi Events & Decor operates outside Sydney.

## Email form setup on Vercel

The enquiry form posts to `/api/enquiry` and sends the message directly to `admin@khusi.com.au` from the website using a Vercel serverless function.

1. Create a Resend account and verify the email/domain you want to send from.
2. In Vercel, open **Project Settings > Environment Variables** and add:
   - `RESEND_API_KEY` with your Resend API key.
   - `CONTACT_TO_EMAIL` with `admin@khusi.com.au`.
   - `CONTACT_FROM_EMAIL` with a verified sender, for example `Khusi Events <enquiries@yourdomain.com>`. If you do not have a verified sender yet, remove this variable and the API will use Resend's `Khusi Events <onboarding@resend.dev>` test sender.
3. Redeploy the Vercel project after adding or changing the environment variables.

The local static preview at `127.0.0.1` cannot send real email because the Vercel serverless function only runs after deployment.


## SEO files

- `robots.txt` allows search engines to crawl the site and points them to the sitemap.
- `sitemap.xml` lists the homepage and packages page for Google Search Console.
- Page metadata and JSON-LD structured data use the live domain `https://www.khusi.com.au`.

## RSVP page

- `rsvp.html` is a standalone invitation RSVP page. On Vercel it can be opened at `https://www.khusi.com.au/rsvp`.
- RSVP submissions post to `/api/rsvp` and use the same `RESEND_API_KEY` and `CONTACT_TO_EMAIL` environment variables as the enquiry form.
