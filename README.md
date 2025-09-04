# Tunca Law Firm - Full-Stack Next.js Application

A comprehensive law firm website built with Next.js 14, Prisma ORM, and Supabase PostgreSQL database. Features include a public website, admin panel, role-based authentication, and content management system.

## 🚀 Features

- **Public Website**: Blog, team members, practice areas, and contact form
- **Admin Panel**: Protected admin interface for content management
- **Authentication**: NextAuth with credentials provider and role-based access control
- **Database**: Prisma ORM with Supabase PostgreSQL
- **Responsive Design**: Modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support

## 🏗️ Architecture

### User Roles
- **SUPERADMIN**: Project owner with full access
- **ADMIN**: Law firm main account
- **STAFF**: Created by ADMIN
- **CUSTOMER**: Normal website visitor (no admin access)

### Database Models
- **User**: Authentication and role management
- **Blog**: Blog posts with slug-based routing
- **Team**: Team member profiles
- **PracticeArea**: Legal practice areas
- **ContactForm**: Contact form submissions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + Supabase PostgreSQL
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd tuncabackend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Update `.env.local` with your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tuncabackend"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Database Setup

Generate Prisma client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Database (Optional)

Create initial data including superadmin user:

```bash
npm run db:seed
```

**Default Superadmin Credentials:**
- Email: `admin@tuncalaw.com`
- Password: `admin123`

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the public website.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── blog/              # Public blog pages
│   ├── contact/           # Contact page
│   ├── practice-areas/    # Practice areas page
│   ├── team/              # Team page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── auth-utils.ts    # Authentication utilities
│   ├── prisma.ts        # Prisma client
│   └── seed.ts          # Database seeding
├── types/               # TypeScript type definitions
└── middleware.ts        # Route protection middleware
```

## 🔐 Authentication & Authorization

### API Route Protection
All admin API routes are protected with role-based access control:

```typescript
const session = await getServerSession(authOptions)
if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Page Protection
Admin pages use server-side protection:

```typescript
export default async function AdminPage() {
  const user = await requireAdmin() // Redirects if not authorized
  // ... page content
}
```

## 📊 API Endpoints

### Public Endpoints
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/[slug]` - Get single blog post
- `GET /api/team` - Get all team members
- `GET /api/practice-areas` - Get all practice areas
- `POST /api/contact` - Submit contact form

### Admin Endpoints (Protected)
- `POST /api/blog` - Create blog post
- `PUT /api/blog/[slug]` - Update blog post
- `DELETE /api/blog/[slug]` - Delete blog post
- `POST /api/team` - Create team member
- `POST /api/practice-areas` - Create practice area
- `GET /api/contact` - Get contact form submissions

## 🎨 Customization

### Adding New User Roles
1. Update the `UserRole` enum in `prisma/schema.prisma`
2. Update role checks in API routes and auth utilities
3. Update middleware configuration

### Styling
The project uses Tailwind CSS. Customize the design by:
- Modifying component classes
- Updating the color scheme in `tailwind.config.js`
- Adding custom CSS in `globals.css`

### Content Management
Admin users can manage:
- Blog posts (create, edit, delete)
- Team members
- Practice areas
- View contact form submissions

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using Next.js, Prisma, and Supabase.
