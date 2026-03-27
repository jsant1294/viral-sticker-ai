// next.config.mjs
/**
 * ViralStickerAI - Next.js Configuration
 * Features: Tailwind CSS, Image optimization, API routes, compression
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================================================
  // OPTIMIZATION
  // ========================================================================
  // Compress all responses
  compress: true,

  // Enable React strict mode for development
  reactStrictMode: true,

  // ========================================================================
  // IMAGE OPTIMIZATION
  // ========================================================================
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    // Cache optimized images
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ========================================================================
  // INTERNATIONALIZATION (i18n) - For bilingual support
  // ========================================================================
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },

  // ========================================================================
  // HEADERS & SECURITY
  // ========================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ========================================================================
  // REDIRECTS (if needed for legacy routes)
  // ========================================================================
  async redirects() {
    return [
      // Example: redirect old sticker path to new path
      {
        source: '/shop/stickers/:path*',
        destination: '/stickers/:path*',
        permanent: true,
      },
    ];
  },

  // ========================================================================
  // REWRITES (for API route aliasing)
  // ========================================================================
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite /api/v1/* to /api/*
        {
          source: '/api/v1/:path*',
          destination: '/api/:path*',
        },
      ],
    };
  },

  // ========================================================================
  // WEBPACK CUSTOMIZATION (optional)
  // ========================================================================
  webpack: (config, { isServer }) => {
    // Add custom webpack config here if needed
    return config;
  },

  // ========================================================================
  // ENVIRONMENT VARIABLES
  // ========================================================================
  env: {
    // Make environment variables available to client-side code
    // Only use NEXT_PUBLIC_ prefix for client-side vars
  },

  // ========================================================================
  // EXPERIMENTAL FEATURES (optional, for future-proofing)
  // ========================================================================
  experimental: {
    // Enable optimized package imports if available
    optimizePackageImports: ['@stripe/react-stripe-js'],
  },

  // ========================================================================
  // BUILD OPTIMIZATION
  // ========================================================================
  swcMinify: true, // Use SWC for faster minification
  poweredByHeader: false, // Remove X-Powered-By header
};

export default nextConfig;
