#!/bin/bash

# Deployment script for tunca-admin.digitalvoyage.agency

echo "🚀 Starting deployment to tunca-admin.digitalvoyage.agency..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Build the project locally to check for errors
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://tunca-admin.digitalvoyage.agency"
echo ""
echo "📋 Next steps:"
echo "1. Set up your custom domain in Vercel dashboard"
echo "2. Configure environment variables"
echo "3. Set up your production database"
echo "4. Test all features"
