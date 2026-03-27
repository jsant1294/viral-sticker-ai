// ============================================================================
// VIRALSTICKERAI.COM - NEXT.JS PROJECT STRUCTURE
// ============================================================================

/*
PROJECT STRUCTURE (Next.js 14 App Router):

viralstickerai/
│
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home page / Landing
│   ├── not-found.tsx                 # 404 page
│   ├── error.tsx                     # Global error boundary
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # User login
│   │   └── signup/page.tsx           # User registration
│   │
│   ├── (shop)/
│   │   ├── products/
│   │   │   ├── page.tsx              # All products with filtering
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Product detail page
│   │   │
│   │   ├── stickers/
│   │   │   └── page.tsx              # Sticker category page
│   │   │
│   │   ├── dtf-apparel/
│   │   │   └── page.tsx              # DTF apparel category page
│   │   │
│   │   ├── sublimation/
│   │   │   └── page.tsx              # Sublimation category page
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx              # Shopping cart page
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Checkout flow
│   │   │   └── confirmation/[orderId]/page.tsx
│   │   │
│   │   ├── ai-designer/
│   │   │   └── page.tsx              # AI designer prompt interface
│   │   │
│   │   └── help/
│   │       └── page.tsx              # Help & support page
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts        # Auth endpoint
│       │   └── logout/route.ts
│       │
│       ├── products/
│       │   ├── route.ts              # GET all products, POST admin
│       │   └── [id]/route.ts         # GET product by ID
│       │
│       ├── cart/
│       │   ├── route.ts              # Cart operations
│       │   └── [id]/route.ts
│       │
│       ├── orders/
│       │   ├── route.ts              # Create order
│       │   └── [id]/route.ts         # Get order status
│       │
│       ├── checkout/
│       │   ├── route.ts              # Create Stripe session
│       │   └── webhook/route.ts      # Stripe webhook handler
│       │
│       ├── shipping/
│       │   └── rates/route.ts        # Get shipping rates
│       │
│       └── help/
│           ├── conversations/route.ts
│           └── messages/route.ts     # Chat widget API
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Main navigation & language toggle
│   │   ├── Footer.tsx                # Footer with links
│   │   ├── NavigationTabs.tsx         # Stickers/DTF/Sublimation tabs
│   │   └── LanguageToggle.tsx         # EN/ES toggle
│   │
│   ├── product/
│   │   ├── ProductCard.tsx            # Product grid card
│   │   ├── ProductGrid.tsx            # Product list grid
│   │   ├── ProductDetail.tsx          # Product detail modal/page
│   │   ├── ProductFilter.tsx          # Category/price filters
│   │   └── CustomizationPanel.tsx     # Custom text/logo uploader
│   │
│   ├── cart/
│   │   ├── CartWidget.tsx             # Cart sidebar/modal
│   │   ├── CartItem.tsx               # Individual cart item
│   │   └── CartSummary.tsx            # Total, tax, shipping
│   │
│   ├── checkout/
│   │   ├── ShippingForm.tsx           # Address form
│   │   ├── ShippingMethodSelect.tsx   # Shipping options
│   │   ├── PaymentForm.tsx            # Stripe payment form
│   │   └── OrderReview.tsx            # Order review before payment
│   │
│   ├── help/
│   │   ├── HelpWidget.tsx             # Floating help button & chat panel
│   │   ├── ChatPanel.tsx              # Chat message display
│   │   └── AgentSelect.tsx            # Multi-agent selector
│   │
│   ├── common/
│   │   ├── Button.tsx                 # Reusable button component
│   │   ├── Input.tsx                  # Reusable input
│   │   ├── Modal.tsx                  # Modal container
│   │   ├── Loading.tsx                # Loading spinner
│   │   └── Toast.tsx                  # Toast notifications
│   │
│   └── ui/
│       └── ... (shadcn/ui components if using)
│
├── lib/
│   ├── supabase.ts                   # Supabase client setup
│   ├── stripe.ts                     # Stripe client setup
│   ├── auth.ts                       # Auth utilities
│   ├── cart.ts                       # Cart helper functions
│   ├── orders.ts                     # Order helper functions
│   ├── i18n.ts                       # i18n utilities (EN/ES)
│   ├── constants.ts                  # App constants
│   └── utils.ts                      # General utilities
│
├── types/
│   ├── index.ts                      # Central type definitions
│   ├── products.ts                   # Product types
│   ├── orders.ts                     # Order types
│   ├── user.ts                       # User types
│   └── api.ts                        # API response types
│
├── hooks/
│   ├── useCart.ts                    # Cart state management
│   ├── useAuth.ts                    # Auth state management
│   ├── useLanguage.ts                # Language preference hook
│   └── useShippingRates.ts           # Shipping rates hook
│
├── context/
│   ├── AuthContext.tsx               # Auth context provider
│   ├── CartContext.tsx               # Cart context provider
│   ├── LanguageContext.tsx           # Language context provider
│   └── ToastContext.tsx              # Toast notification context
│
├── public/
│   ├── images/
│   │   ├── hero-bg.webp              # Hero background
│   │   ├── logo.svg                  # ViralStickerAI logo
│   │   └── icons/
│   │       ├── sticker.svg
│   │       ├── dtf.svg
│   │       └── sublimation.svg
│   │
│   └── fonts/
│       └── ... (custom fonts if needed)
│
├── styles/
│   ├── globals.css                   # Global styles
│   ├── variables.css                 # CSS variables
│   └── animations.css                # Animation definitions
│
├── .env.example                      # Environment variable template
├── .env.local                        # Local environment (not in git)
├── .gitignore                        # Git ignore rules
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Project documentation
*/

// ============================================================================
// Key Dependencies (package.json will include):
// ============================================================================
/*
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.38.0",
    "stripe": "^13.0.0",
    "@stripe/react-stripe-js": "^2.0.0",
    "@stripe/stripe-js": "^1.46.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "zustand": "^4.4.0",
    "react-hot-toast": "^2.4.0",
    "next-intl": "^3.0.0",
    "axios": "^1.6.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
*/
