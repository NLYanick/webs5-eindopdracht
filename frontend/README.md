# TargetApp Frontend

A modern React + TypeScript frontend for the TargetApp microservices application. Built with Vite, React Router, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Secure JWT-based login and registration
- 🎯 **Target Management** - Create, view, and manage targets
- 📸 **Image Submissions** - Upload images to targets
- 👍 **Voting System** - Thumbs up/down voting on submissions
- 🔑 **Role-Based Access Control** - Different permissions for target creators and participants
- 📱 **Responsive Design** - Mobile-friendly interface
- ⚡ **Code Splitting** - Lazy-loaded pages for optimal performance

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7+
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v4
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **State Management**: React Context API
- **Date Utility**: date-fns

## Project Structure

```
src/
├── pages/              # Page components
│   ├── HomePage.tsx           # Landing page
│   ├── LoginPage.tsx          # Login form
│   ├── RegisterPage.tsx       # Registration form
│   ├── TargetsPage.tsx        # Target list
│   ├── CreateTargetPage.tsx   # Create new target
│   ├── TargetDetailPage.tsx   # Target details & voting
│   └── ProfilePage.tsx        # User profile
├── components/         # Reusable components
│   ├── Navigation.tsx         # Header navigation
│   └── ProtectedRoute.tsx     # Route protection
├── contexts/           # React Context
│   └── AuthContext.tsx        # Authentication context
├── services/           # API services
│   └── api.ts               # Axios API client
├── types/              # TypeScript types
│   └── index.ts              # Type definitions
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── App.tsx             # Router configuration
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend services running on localhost:3000 (API Gateway)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` if not exists):
```env
VITE_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run tsc
```

## API Integration

The frontend communicates with 6 microservices through an API Gateway:

1. **Auth Service** - User authentication (login, register)
2. **Target Service** - Target management and voting
3. **Submission Service** - Image submission handling
4. **Register Service** - Participant registration
5. **Reader Service** - Data querying
6. **Score Service** - Automated scoring (synced via Reader)

### API Client Example

```typescript
import { apiClient } from './services/api';

// Login
const response = await apiClient.login(email, password);

// Create target
const target = await apiClient.createTarget(formData);

// Vote on submission
await apiClient.vote(targetId, 'thumbsUp');
```

## Authentication Flow

1. User enters credentials on login/register page
2. Credentials sent to Auth Service
3. JWT token received and stored in localStorage
4. Token automatically added to all subsequent API requests
5. Token persisted in AuthContext for app-wide access
6. Protected routes redirect unauthenticated users to login

## Key Pages

### HomePage
- Landing page with feature overview
- Quick navigation links for authenticated users
- Call-to-action buttons for signup/login

### LoginPage & RegisterPage
- Email/password forms with validation
- Error message display
- Cross-links between login and register

### TargetsPage
- Lists all available targets
- Filterable by city
- Search functionality
- Grid layout with target cards
- Links to create new target or view details

### CreateTargetPage
- Form to create new targets
- Fields: title, city, coordinates, radius, endDate
- Drag-and-drop file upload
- Form validation
- Loading states on save

### TargetDetailPage
- Target information display
- Owner can delete target
- Non-owners can register/unregister
- Voting system (registered users only)
- Submission upload section
- View user's submissions with scores
- Vote statistics display

### ProfilePage
- User profile with email
- Tab view for targets and submissions
- List of user's created targets with delete option
- Gallery of user's submissions across targets
- Account management (logout option)

## Production Build

```bash
npm run build
```

Output files are in the `dist/` directory. Ready for deployment to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Deployment Checklist

- [ ] Update `VITE_API_URL` environment variable
- [ ] Build: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Deploy `dist/` directory
- [ ] Verify API connectivity
- [ ] Test authentication flow
- [ ] Test all CRUD operations

## Future Enhancements

- [ ] Error Boundary component for error handling
- [ ] Toast notifications for user feedback
- [ ] Loading skeleton components
- [ ] Image preview before submission
- [ ] Geolocation integration
- [ ] Admin dashboard
- [ ] PWA capabilities
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Performance monitoring

## Troubleshooting

### Backend Connection Issues
- Ensure API Gateway is running on port 3000
- Check `VITE_API_URL` environment variable
- Verify CORS settings on backend

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Ensure Node version >= 18

### Development Server Issues
- Kill process on port 5173 if it's already running
- Check firewall settings
- Try with `--host` flag for network access

## License

MIT

## Support

For issues or questions, contact the development team.
