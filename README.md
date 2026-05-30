# Expense Tracker App

A comprehensive full-stack expense tracking application built with Next.js, MongoDB, and AI-powered budgeting assistance.

## Features

### Authentication & User Management
- User registration and login with session-based authentication
- Secure password hashing with bcryptjs
- Session storage in MongoDB with automatic expiration
- Multi-language support (English, French, Arabic) with RTL support for Arabic

### Expense Management
- Add, edit, and delete expenses
- Categorize expenses (food, transportation, entertainment, shopping, utilities, healthcare, education, other)
- Tag expenses for better organization
- View expense list with filtering by date and category
- Real-time expense totals and statistics

### Budget & Categories
- Create custom budget categories
- Set budget limits per category
- Track spending against budget
- Visual budget monitoring

### Analytics Dashboard
- View total spending for the current month
- Compare spending across months
- Category breakdown visualizations
- Spending trends analysis
- Monthly spending reports

### Merchandise Shop
- Browse available merchandise items
- Purchase items with quantity selection
- Purchase history tracking
- User-specific purchase records

### AI Budget Assistant
- Powered by Groq API for fast inference
- Intelligent budget advice and insights
- Expense analysis and recommendations
- Contextual suggestions based on spending patterns
- Chat-based interface for natural conversations

### Internationalization (i18n)
- Full support for English, French, and Arabic
- RTL layout support for Arabic
- Locale-specific date and currency formatting
- All UI text translated

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **next-intl** - Internationalization
- **SWR** - Data fetching and caching
- **Recharts** - Data visualization (for analytics)
- **shadcn/ui** - Pre-built UI components

### Backend
- **Next.js API Routes** - REST API
- **MongoDB** - Document database (MongoDB Atlas)
- **Mongoose** - MongoDB object modeling
- **Zod** - Schema validation
- **bcryptjs** - Password hashing
- **Groq SDK** - AI assistant integration

### AI Integration
- **Groq** - Fast LLM inference for budget assistant
- **Mixtral-8x7b** - Language model for generating advice

## Architecture

### Database Models
- **User** - User accounts with preferences
- **Session** - User session management
- **Expense** - Individual expense records
- **Category** - Budget categories
- **Merchandise** - Shop items
- **Purchase** - Purchase history
- **ChatHistory** - AI conversation history

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

#### Expenses
- `GET /api/expenses` - List user expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get expense details
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

#### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

#### Chat/AI
- `POST /api/chat` - Send message to AI assistant

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB Atlas account (free tier available)
- Groq API key (free tier available at console.groq.com)

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# AI
GROQ_API_KEY=your_groq_api_key_here
```

### Installation

1. **Clone and install dependencies:**
```bash
pnpm install
```

2. **Set environment variables:**
   - Add `MONGODB_URI` from MongoDB Atlas
   - Add `GROQ_API_KEY` from Groq Console

3. **Run development server:**
```bash
pnpm dev
```

4. **Open browser:**
   Visit `http://localhost:3000`

## Usage

### First Time Users
1. Navigate to `/register`
2. Create account with your name, email, and password
3. Select your preferred language (English, French, or Arabic)
4. Account created and logged in automatically

### Adding Expenses
1. Go to `/expenses` page
2. Click "Add Expense" button
3. Fill in amount, category, description, date, and optional tags
4. Click "Save Expense"
5. View all expenses in the table below

### Using the AI Assistant
1. Navigate to `/assistant` page
2. Type a question about your budget (e.g., "How can I reduce my food spending?")
3. AI analyzes your expense history and provides personalized advice
4. View conversation history

### Managing Budget
1. Go to `/categories` page
2. Create categories and set monthly budget limits
3. Track spending against budget
4. Adjust budgets as needed

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `GROQ_API_KEY`
4. Deploy with one click

## Security Features

- HTTP-only cookies for session tokens
- Bcrypt password hashing with salt
- Input validation with Zod schemas
- CSRF protection headers
- Secure session expiration (30 days)
- User isolation (users can only access their own data)
- SQL injection prevention with Mongoose

## Performance Optimizations

- SWR for efficient data fetching and caching
- MongoDB indexes on frequently queried fields
- Image optimization with Next.js Image component
- CSS minification with Tailwind
- Code splitting with Next.js App Router
- Automatic session cleanup with MongoDB TTL

## Future Enhancements

- [ ] Export expenses to CSV/PDF
- [ ] Recurring expense templates
- [ ] Budget alerts and notifications
- [ ] Mobile app with React Native
- [ ] Advanced charts and visualizations
- [ ] Expense splitting with friends
- [ ] Integration with bank APIs
- [ ] Multi-currency support
- [ ] Offline-first PWA features
- [ ] Real-time collaboration

## Project Structure

```
/app
  /api           - API routes
    /auth        - Authentication endpoints
    /expenses    - Expense management
    /categories  - Category management
    /chat        - AI chat endpoint
  /[locale]      - Localized pages
    /(auth)      - Login/Register pages
    /(protected) - Protected pages (dashboard, expenses, etc.)
    /page.tsx    - Home page redirect

/lib
  /models        - Mongoose schemas
  mongodb.ts     - Database connection
  auth.ts        - Authentication utilities
  schemas.ts     - Zod validation schemas

/hooks
  use-auth.ts    - Authentication hook with SWR

/components
  /ui            - shadcn/ui components

/messages        - Translation files (en.json, fr.json, ar.json)

/middleware.ts   - i18n routing middleware
/i18n.ts         - i18n configuration
/i18n.config.ts  - Locale configuration
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - feel free to use this project as a template for your own apps

## Support

For issues and questions, please open an issue on GitHub or contact support.

## Changelog

### v1.0.0 (Initial Release)
- User authentication system
- Expense tracking and management
- Budget categories and limits
- Analytics dashboard
- Merchandise shop
- Groq AI budget assistant
- Multi-language support (English, French, Arabic)
- Responsive design for all devices
