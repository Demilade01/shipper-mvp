# Shipper 🚀

A modern, real-time chat application built with Next.js, Socket.io, and Prisma. Connect with your team instantly through fast, secure, and free messaging.

![Shipper Landing Page](./public/screenshot.png)

## ✨ Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Presence**: See who's online in real-time
- **File Attachments**: Share images and files with drag-and-drop support
- **Google OAuth**: Quick sign-in with Google authentication
- **AI Chat Assistant**: Chat with an AI-powered assistant
- **Modern UI**: Beautiful, minimal design with glassy effects and smooth animations
- **Mobile Responsive**: Fully responsive design for all devices
- **Typing Indicators**: Know when someone is typing
- **Message History**: Persistent message storage with Prisma

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Socket.io** - Real-time bidirectional communication
- **Prisma** - Modern ORM with PostgreSQL
- **Prisma Accelerate** - Connection pooling and caching
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Vercel Blob** - Cloud file storage

### Database
- **PostgreSQL** - Relational database
- **Prisma Migrate** - Database migrations

## 📁 Project Structure

```
shipper-mvp/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── google/           # Google OAuth
│   │   │   ├── login/            # Login endpoint
│   │   │   ├── logout/           # Logout endpoint
│   │   │   ├── me/               # Current user endpoint
│   │   │   ├── register/         # Registration endpoint
│   │   │   ├── refresh/          # Token refresh
│   │   │   └── socket-token/     # Socket authentication
│   │   ├── chat/                 # Chat-related endpoints
│   │   │   └── ai/               # AI chat assistant
│   │   ├── chats/                # Chat management
│   │   ├── messages/             # Message CRUD
│   │   ├── upload/               # File upload (Vercel Blob)
│   │   └── users/                # User management
│   │       └── ai/               # AI user endpoint
│   ├── chat/                     # Chat page
│   │   └── page.tsx
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── register/                 # Registration page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   ├── middleware.ts             # Route protection
│   └── providers.tsx             # React Query provider
│
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── GoogleAuthButton.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── chat/                     # Chat components
│   │   ├── ChatInput.tsx         # Message input with file upload
│   │   ├── ChatWindow.tsx        # Message display
│   │   └── UserList.tsx          # Online users sidebar
│   ├── landing/                  # Landing page components
│   │   ├── Navigation.tsx        # Header navigation
│   │   ├── Hero.tsx              # Hero section
│   │   ├── Features.tsx          # Features section
│   │   ├── HowItWorks.tsx        # How it works section
│   │   ├── CTA.tsx               # Call-to-action
│   │   └── Footer.tsx            # Footer
│   └── ui/                       # Reusable UI components
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── separator.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication logic
│   ├── useSocket.ts              # Socket.io connection
│   ├── useUsers.ts               # User management
│   ├── useChats.ts               # Chat management
│   ├── useMessages.ts            # Message handling
│   └── useAIUser.ts              # AI chat integration
│
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth helpers
│   ├── cookies.ts                # Cookie management
│   ├── db.ts                     # Prisma client
│   ├── getUser.ts                # User fetching
│   ├── utils.ts                  # General utilities
│   ├── validation.ts             # Validation schemas
│   └── ai-user.ts                # AI user helper
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
│   ├── screenshot.png            # Landing page screenshot
│   └── ...                       # Other static files
│
├── server.js                     # Custom server with Socket.io
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (or use Prisma Accelerate)
- Google OAuth credentials (for Google sign-in)
- Vercel account (for Blob storage)
- OpenAI API key (optional, for AI chat)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipper-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database"

   # Authentication
   JWT_ACCESS_SECRET="your-access-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

   # OpenAI (optional, for AI chat)
   OPENAI_API_KEY="your-openai-api-key"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Open Prisma Studio to view your data
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server with Socket.io
- `npm run build` - Build for production (generates Prisma Client first)
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

Shipper supports two authentication methods:

1. **Email/Password Registration**: Traditional registration with email and password
2. **Google OAuth**: One-click sign-in with Google account

## 💬 Chat Features

- **Direct Messages**: One-on-one conversations between users
- **Group Chats**: Multiple users in a single chat
- **File Sharing**: Upload and share images, documents, and other files
- **Real-time Updates**: Instant message delivery and presence updates
- **Typing Indicators**: See when someone is typing
- **Message History**: All messages are persisted in the database

## 🎨 Design System

The application uses a modern, minimal design with:

- **Color Palette**: Dark navy (`#070825`) with white backgrounds
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Smooth Animations**: Framer Motion for engaging transitions
- **Typography**: Inter and Poppins fonts
- **Mobile-First**: Fully responsive design

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

The app will automatically build and deploy. Make sure to:
- Set up your PostgreSQL database (or use Prisma Accelerate)
- Configure Vercel Blob storage
- Add all required environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Real-time features powered by [Socket.io](https://socket.io)
- Database management with [Prisma](https://www.prisma.io)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)

---

Made with ❤️ using Next.js and Socket.io
