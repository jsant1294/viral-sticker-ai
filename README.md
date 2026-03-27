# 🎨 ViralStickerAI.com - AI-Assisted E-Commerce Platform

A production-ready, bilingual (English/Spanish) e-commerce platform for selling custom stickers, DTF apparel, and sublimation products. Built with Next.js 14, Supabase, Stripe, and Tailwind CSS.

## 🚀 Features

### Core E-Commerce
- ✅ **Bilingual UI** (English/Español) with persistent language preference
- ✅ **Product Catalog** with 25+ sample products across 3 categories
- ✅ **Responsive Design** (mobile-first, works on all devices)
- ✅ **Shopping Cart** with real-time updates and persistent storage
- ✅ **Secure Checkout** with Stripe payment integration
- ✅ **Order Management** with tracking and status updates

### Product Categories
- **Stickers**: Vinyl, kiss-cut, contour-cut stickers printed on HP Latex 115
- **DTF Apparel**: T-shirts, hoodies, tote bags, hats with direct-to-fabric printing
- **Sublimation**: Mugs, phone cases, mousepads with sublimation printing

### Advanced Features
- 🤖 **AI Designer** - UI for generating custom sticker designs
- 💬 **Multi-Agent Help Widget** - Floating chat with product, shipping, and technical support
- 🎯 **Customization** - Custom text, logo uploads, color selection per product
- 📦 **Shipping Integration** - Zone-based rates, delivery estimates
- 🎁 **Promo Codes** - Support for percentage and fixed discounts
- 🔒 **Secure Auth** - User authentication and order history

## 📁 Project Structure

```
viralstickerai/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (shop)/          # Main e-commerce routes
│   │   ├── products/    # Product listing & details
│   │   ├── stickers/    # Sticker category
│   │   ├── dtf-apparel/ # DTF category
│   │   ├── sublimation/ # Sublimation category
│   │   ├── cart/        # Shopping cart
│   │   ├── checkout/    # Payment flow
│   │   ├── ai-designer/ # AI design generator
│   │   └── help/        # Support page
│   └── api/             # API routes (payments, cart, orders)
│
├── components/
│   ├── layout/          # Header, footer, navigation
│   ├── product/         # Product cards, grids, filters
│   ├── cart/            # Cart sidebar, items
│   ├── checkout/        # Shipping form, payment form
│   ├── help/            # Help widget, chat
│   └── common/          # Reusable buttons, modals, etc.
│
├── context/             # React contexts (auth, cart, language)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (Supabase, Stripe, i18n)
├── types/               # TypeScript type definitions
├── public/              # Static assets
├── styles/              # Global CSS
├── .env.example         # Environment variable template
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS setup
└── package.json         # Dependencies
```

## 🗄️ Database Schema

### Tables
- **products** - Product catalog with bilingual descriptions
- **product_variants** - Size, color, SKU variations
- **categories** - Sticker/DTF/Sublimation categories
- **cart** - User shopping cart with customizations
- **orders** - Order records with status tracking
- **order_items** - Line items in orders
- **users** - User profiles and preferences
- **shipping_zones** - Geographic shipping regions
- **shipping_rates** - Zone-based shipping methods
- **promo_codes** - Discount codes
- **help_conversations** - Customer support chat history
- **reviews** - Product ratings and reviews

All tables include Row Level Security (RLS) for multi-user safety.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3, CSS Variables |
| **Backend** | Next.js API Routes, Serverless Functions |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Authentication** | Supabase Auth |
| **Payments** | Stripe (checkout sessions & webhooks) |
| **Hosting** | Vercel |
| **State Management** | React Context + Zustand (optional) |
| **HTTP Client** | Fetch API / Axios |

## 📦 Sample Data

The included SQL schema creates:
- **3 categories** (Stickers, DTF Apparel, Sublimation)
- **25 products** with:
  - Bilingual names & descriptions
  - Realistic pricing ($11.99 - $44.99)
  - AI prompt metadata
  - Material & finish attributes
  - Customization capabilities
- **Shipping zones** (USA, Canada, International)
- **Shipping rates** (Standard, Express)
- **3 promo codes** for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier ok)
- Stripe account (free tier ok)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/viralstickerai.git
cd viralstickerai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Supabase

```bash
# In Supabase Dashboard:
# 1. Create new project
# 2. Get API URL and anon key
# 3. Run the schema SQL file:

# Paste viralstickerai-schema.sql into Supabase SQL editor
# Execute to create all tables and sample data
```

Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Configure Stripe

```bash
# Get keys from Stripe Dashboard
# Update .env.local:

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### 4. Run Locally

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

## 🎯 Key Components

### Header + Navigation
```tsx
import Header, { Footer } from '@/components/layout/Header';
import LanguageToggle from '@/components/layout/LanguageToggle';
```
- Sticky header with logo, nav tabs, language toggle
- Cart indicator with item count
- Mobile-responsive hamburger menu

### Product Catalog
```tsx
import ProductCard from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
```
- Responsive grid (1-4 columns based on screen)
- Product images with lazy loading
- Price, stock status, tags
- Quick "Add to Cart" with optional customization

### Shopping Cart
```tsx
import { CartWidget } from '@/components/cart/CartWidget';
```
- Persistent cart (localStorage + Supabase sync)
- Real-time quantity updates
- Subtotal, tax, shipping calculation
- Checkout flow

### Multi-Agent Help Widget
```tsx
import { HelpWidget } from '@/components/help/HelpWidget';
```
- Floating button (bottom-right corner)
- 4 agent types with mock responses:
  - Product Specialist
  - Shipping & Orders
  - Technical Support
  - General Support
- Bilingual chat with message history

### AI Designer
```tsx
// app/(shop)/ai-designer/page.tsx
```
- Text prompt input
- Style selector (Modern, Retro, Kawaii, etc.)
- Mood selector (Vibrant, Calm, Dreamy, etc.)
- Color palette chooser
- Design preview and cart integration

## 💳 Stripe Integration

### Checkout Flow
1. User adds items to cart
2. Proceeds to checkout
3. Enters shipping/billing address
4. Reviews order summary
5. Redirected to Stripe Checkout
6. Stripe webhook confirms payment
7. Order status updated to "confirmed"
8. Cart cleared

### Webhooks
- `checkout.session.completed` - Payment confirmed, update order
- `charge.refunded` - Refund processed, update order status

### API Endpoints
- `POST /api/checkout` - Create Stripe session
- `POST /api/webhook` - Handle Stripe events

## 🌍 Bilingual Support

### Language Context
```tsx
const { language, setLanguage, t } = useLanguage();

// Usage:
<h1>{t('nav.home')}</h1>
setLanguage('es'); // Switch to Spanish
```

### Translations Object
- 25+ keys for UI strings
- EN/ES translations in `context/LanguageContext.tsx`
- Language preference persisted in localStorage
- Fallback to browser language on first visit

## 📱 Responsive Design

- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1024px): 2 columns, adjusted spacing
- **Desktop** (> 1024px): 3-4 columns, full navigation
- **Large** (> 1280px): Maximum width container, side panels

## 🔐 Security

- Row Level Security (RLS) on Supabase tables
- Stripe signature verification on webhooks
- Environment variables for secrets
- HTTPS-only in production (Vercel)
- CORS headers configured
- SQL injection prevention (parameterized queries)

## 📊 Analytics & Monitoring

### In Vercel
- Deployment logs
- API route execution metrics
- Core Web Vitals
- Error tracking

### In Stripe
- Payment success/failure rates
- Revenue dashboard
- Webhook delivery status

### In Supabase
- Query performance
- Auth activity
- Real-time subscriptions

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel
1. Visit https://vercel.com/new
2. Select your GitHub repository
3. Configure environment variables (see `.env.example`)
4. Click "Deploy"

### 3. Set Custom Domain
1. Add domain in Vercel Settings > Domains
2. Update DNS records (CNAME or A record)
3. Wait for SSL certificate (automatic)

### 4. Configure Stripe Webhook
```
Webhook URL: https://viralstickerai.com/api/webhook
Events: checkout.session.completed, charge.refunded
```

### 5. Monitor
- Check Vercel deployments page
- Monitor API routes in Functions tab
- Track analytics in Stripe & Supabase

See `DEPLOYMENT.md` for detailed instructions.

## 🧪 Testing

### Stripe Test Credentials
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Users
Create in Supabase Auth:
- test@example.com / password123
- user@test.com / password456

### Test Promo Codes (from sample data)
- `VIRAL10` - 10% off
- `WELCOME15` - 15% off (min $25)
- `FREESHIP` - Free shipping (min $50)

## 📚 API Reference

### Products
```
GET  /api/products           # Get all products (with filters)
GET  /api/products/[id]      # Get product by ID
```

### Cart
```
GET  /api/cart/[userId]      # Get user's cart
POST /api/cart               # Add to cart
PUT  /api/cart/[id]          # Update cart item
DELETE /api/cart/[id]        # Remove from cart
```

### Orders
```
POST /api/orders             # Create order
GET  /api/orders/[id]        # Get order details
GET  /api/orders/user/[uid]  # Get user's orders
```

### Checkout
```
POST /api/checkout           # Create Stripe session
POST /api/webhook            # Stripe webhook handler
```

### Shipping
```
GET  /api/shipping/rates     # Get rates by country
```

## 🛣️ Routes

### Public Routes
- `/` - Homepage
- `/products` - All products
- `/stickers` - Sticker category
- `/dtf-apparel` - DTF category
- `/sublimation` - Sublimation category
- `/products/[id]` - Product detail
- `/ai-designer` - AI design generator
- `/help` - Support page
- `/cart` - Shopping cart
- `/checkout` - Payment flow
- `/login`, `/signup` - Authentication

### Protected Routes (Auth required)
- `/account` - User profile
- `/orders` - Order history
- `/orders/[id]` - Order detail

### Admin Routes (Future)
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/analytics` - Sales analytics

## 🔄 State Management

### Context Providers
```tsx
<LanguageProvider>
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
</LanguageProvider>
```

### Custom Hooks
```tsx
const { language, setLanguage, t } = useLanguage();
const { items, addItem, removeItem, total } = useCart();
const { user, login, logout } = useAuth();
```

## 🎨 Design System

### Color Palette
- Primary: Purple (#7C3AED)
- Secondary: Pink (#EC4899)
- Gray: #111827 - #F3F4F6
- Success: #10B981
- Error: #EF4444

### Typography
- Display: 3xl (48px), bold
- Heading: 2xl (24px), semibold
- Body: 1rem (16px), regular
- Small: 0.875rem (14px), regular

### Spacing
- 4px, 8px, 12px, 16px, 24px, 32px units
- Tailwind scale for consistency

### Components
- Rounded corners: 8px (lg), 16px (2xl)
- Shadows: sm, md, lg, xl
- Transitions: 200-300ms ease-in-out

## 📈 Performance Targets

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Lighthouse Score**: > 90
- **Page Load**: < 3s (3G network)

## 🐛 Troubleshooting

### Cart not persisting
- Check localStorage is enabled
- Clear browser cache
- Verify Supabase connection

### Stripe payment fails
- Verify API keys in .env.local
- Check webhook URL is correct
- Review Stripe dashboard logs

### Products not loading
- Verify Supabase URL and keys
- Check RLS policies
- Review Supabase query logs

### Language not switching
- Clear localStorage
- Check context is wrapped around app
- Verify language codes (en/es only)

## 📞 Support

### For Stripe Issues
- https://stripe.com/support
- Webhook troubleshooting: https://stripe.com/docs/webhooks/test

### For Supabase Issues
- https://supabase.com/docs
- Community: https://discord.supabase.io

### For Next.js Issues
- https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

## 📄 License

MIT License - Feel free to use this project for commercial purposes.

## 🎯 Future Enhancements

- [ ] Real AI image generation (OpenAI/Stable Diffusion integration)
- [ ] Advanced analytics dashboard
- [ ] Inventory management system
- [ ] Email notifications (order confirmation, shipping)
- [ ] Customer reviews and ratings
- [ ] Wishlist/favorites
- [ ] Social media integration (share designs)
- [ ] Affiliate program
- [ ] Subscription orders
- [ ] Multi-currency support
- [ ] File upload validation (virus scanning)
- [ ] 3D product previews
- [ ] YouTube tutorials integration
- [ ] Community design gallery

## 🙏 Acknowledgments

Built with:
- Next.js by Vercel
- Supabase by Supabase
- Stripe by Stripe
- Tailwind CSS by Tailwind Labs
- React by Facebook

---

**Made with ❤️ for ViralStickerAI.com**

Questions? Check the docs or create an issue on GitHub!
