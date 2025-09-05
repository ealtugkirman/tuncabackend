# Vercel Deployment Guide - tunca-admin.digitalvoyage.agency

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a production PostgreSQL database (Neon, Supabase, or Railway)
3. **Cloudinary Account**: For image uploads
4. **Custom Domain**: tunca-admin.digitalvoyage.agency

## Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://tunca-admin.digitalvoyage.agency"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://tunca-admin.digitalvoyage.agency"
NEXT_PUBLIC_BASE_URL="https://tunca-admin.digitalvoyage.agency"

# Multilingual
NEXT_PUBLIC_DEFAULT_LANGUAGE="TR"
NEXT_PUBLIC_SUPPORTED_LANGUAGES="TR,EN"

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

### Optional Variables

```env
# Email (if using email features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### 3. Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `./` (if project is in root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)

### 4. Set Environment Variables

Add all required environment variables in Vercel dashboard.

### 5. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

### 1. Database Setup

```bash
# Run migrations on production
npx prisma db push --force

# Or run migrations
npx prisma migrate deploy
```

### 2. Test the Application

1. Visit your Vercel URL
2. Test admin login
3. Test image uploads
4. Test all features

### 3. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **NextAuth Issues**: Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
3. **Image Uploads**: Verify Cloudinary configuration
4. **Build Errors**: Check build logs in Vercel dashboard

### Useful Commands

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check Prisma connection
npx prisma db pull
```

## Performance Optimization

1. **Image Optimization**: Already configured for Cloudinary
2. **Static Generation**: Use `getStaticProps` where possible
3. **Caching**: Vercel handles this automatically
4. **CDN**: Vercel provides global CDN

## Security

1. **Environment Variables**: Never commit `.env` files
2. **API Routes**: All protected with authentication
3. **Headers**: Security headers configured in `next.config.ts`
4. **HTTPS**: Vercel provides SSL certificates

## Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Error Tracking**: Check Vercel dashboard for errors
3. **Database**: Monitor your database provider's dashboard
