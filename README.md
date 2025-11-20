# Noble Extranet

A secure, authenticated web portal for Noble Investment Group to manage internal and external users.

## Features

- **User Authentication** - Secure email/password authentication powered by Supabase
- **User Management** - Admin interface to view, edit, and delete users
- **User Types** - Distinguish between internal and external users
- **Search & Filter** - Find users by name, email, or user type
- **Responsive Design** - Clean interface matching Noble Investment Group's branding
- **Dashboard** - Personalized welcome screen with quick access to modules

## Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript (ES6 Modules)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with Noble Investment Group branding
- **Deployment**: Static files (can be hosted anywhere)

## Quick Start

### 1. Set Up Supabase (10 minutes)

Follow the detailed guide in **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** which covers:
- Creating a Supabase account and project
- Getting your API keys
- Creating the database schema
- Setting up Row Level Security policies

### 2. Configure the Application

1. Open [js/supabase-config.js](js/supabase-config.js)
2. Replace the placeholder values with your Supabase credentials:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

### 3. Run Locally

```bash
# Navigate to project directory
cd "Noble Extranet"

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### 4. Create Your First Account

1. Click "Create Account" on the login page
2. Fill in your details:
   - Full Name
   - Email
   - Password (6+ characters)
   - User Type (Internal or External)
3. Click "Create Account"
4. You'll be automatically logged in to the dashboard

### 5. Access User Management

1. From the dashboard, click "User Management"
2. You'll see a list of all users
3. You can:
   - Edit user names and types
   - Delete users
   - Filter by user type
   - Search by name or email

## Project Structure

```
Noble Extranet/
├── index.html                 # Login/signup page
├── dashboard.html             # Main dashboard
├── user-management.html       # User management interface
├── js/
│   ├── supabase-config.js    # Supabase configuration
│   ├── auth.js               # Authentication logic
│   ├── dashboard.js          # Dashboard functionality
│   └── user-management.js    # User CRUD operations
├── css/
│   └── styles.css            # Application styles
├── images/
│   └── noble-logo.png        # Noble Investment Group logo
├── README.md                 # This file
├── SUPABASE_SETUP.md        # Detailed setup instructions
└── MIGRATION_SUMMARY.md     # Firebase → Supabase migration notes
```

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (references auth.users) |
| `name` | TEXT | User's full name |
| `email` | TEXT | User's email (unique) |
| `user_type` | TEXT | Either 'internal' or 'external' |
| `created_at` | TIMESTAMP | Account creation timestamp |

### Row Level Security

The application uses Supabase's Row Level Security (RLS) policies:

- **SELECT**: All authenticated users can read all users
- **INSERT**: Users can create their own record during signup
- **UPDATE**: All authenticated users can update any user (admin functionality)
- **DELETE**: All authenticated users can delete any user (admin functionality)

For production, you should restrict UPDATE and DELETE to admin users only. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for details.

## Development

### Adding New Features

The application is built with modular ES6 JavaScript:

1. **Add a new page**: Create an HTML file and corresponding JS file in `/js`
2. **Import Supabase**: `import { supabase } from './supabase-config.js'`
3. **Use Supabase APIs**:
   - Auth: `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`
   - Database: `supabase.from('table').select()`, `.insert()`, `.update()`, `.delete()`

### Styling

All styles are in [css/styles.css](css/styles.css) and follow Noble Investment Group's design language:

- **Colors**: Professional grayscale with green accents
- **Typography**: System fonts for clean, readable text
- **Layout**: CSS Grid and Flexbox for responsive design
- **Components**: Reusable button, card, and form styles

## Security

### Current Setup (Development)

- ✅ Email/password authentication
- ✅ Row Level Security enabled
- ✅ All database operations require authentication
- ⚠️ All authenticated users can manage other users

### Production Recommendations

1. **Add admin role**: Create an `is_admin` column in the users table
2. **Restrict permissions**: Update RLS policies to check admin status for UPDATE/DELETE
3. **Enable email verification**: Turn on email confirmations in Supabase
4. **Add password reset**: Implement forgot password flow
5. **Rate limiting**: Enable Supabase's built-in rate limiting
6. **HTTPS only**: Deploy with SSL certificate

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for SQL examples.

## Deployment

This is a static website that can be deployed to:

- **Netlify** (recommended): Just drag and drop the folder
- **Vercel**: Connect to a Git repository
- **GitHub Pages**: Push to a repo and enable Pages
- **AWS S3**: Upload files and configure static hosting
- **Any web server**: Upload files to any hosting with HTTPS

### Environment Variables

When deploying, you can use environment variables for Supabase credentials:

```javascript
const supabaseUrl = process.env.SUPABASE_URL || 'fallback-url';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'fallback-key';
```

Note: For Netlify/Vercel, you'll need to build step with environment replacement.

## Migration from Firebase

This project was originally built with Firebase and has been migrated to Supabase for better reliability and developer experience.

See [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for:
- Why Supabase is better than Firebase
- What changed in the migration
- How to migrate existing Firebase users

## Troubleshooting

### "Invalid API key" error
- Check that you copied the correct **anon public** key from Supabase
- Make sure there are no extra spaces in [js/supabase-config.js](js/supabase-config.js)

### "relation 'users' does not exist"
- Make sure you ran the SQL script to create the users table
- Go to **Table Editor** in Supabase to verify the table exists

### "new row violates row-level security policy"
- Verify RLS policies were created correctly
- Re-run the policy SQL from [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### Users not appearing in User Management
- Check the browser console (F12) for errors
- Verify you're logged in (check the user email in top right)
- Go to Supabase **Table Editor** → **users** to see if data exists

## Support

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **PostgreSQL Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)

## License

Proprietary - Noble Investment Group

---

**Built with ❤️ for Noble Investment Group**
