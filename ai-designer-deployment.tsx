// app/(shop)/ai-designer/page.tsx
/**
 * AI Designer Page
 * Allows users to input AI prompts and preview generated sticker designs
 * UI-only prototype (no actual AI integration in this version)
 */

'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

const EXAMPLE_DESIGNS = [
  'https://via.placeholder.com/300x300?text=AI+Design+1',
  'https://via.placeholder.com/300x300?text=AI+Design+2',
  'https://via.placeholder.com/300x300?text=AI+Design+3',
];

export default function AIDesignerPage() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [mood, setMood] = useState('vibrant');
  const [colors, setColors] = useState('multi');
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const labels = {
    en: {
      title: 'AI Sticker Designer',
      subtitle: 'Describe your sticker design and let AI create something amazing',
      prompt: 'Describe your sticker design idea',
      promptPlaceholder: 'e.g., "A cute robot surrounded by stars and planets"',
      style: 'Style',
      mood: 'Mood',
      colors: 'Color Palette',
      generate: 'Generate Designs',
      generating: 'Generating...',
      selectDesign: 'Select a design to add to cart',
      addToCart: 'Add Selected Design to Cart',
      selectFirst: 'Please select a design first',
      noPrompt: 'Please enter a prompt first',
    },
    es: {
      title: 'Diseñador de Pegatinas IA',
      subtitle: 'Describe tu idea de pegatina y deja que la IA cree algo increíble',
      prompt: 'Describe tu idea de pegatina',
      promptPlaceholder: 'p. ej., "Un lindo robot rodeado de estrellas y planetas"',
      style: 'Estilo',
      mood: 'Ambiente',
      colors: 'Paleta de Colores',
      generate: 'Generar Diseños',
      generating: 'Generando...',
      selectDesign: 'Selecciona un diseño para añadir al carrito',
      addToCart: 'Añadir Diseño Seleccionado al Carrito',
      selectFirst: 'Por favor selecciona un diseño primero',
      noPrompt: 'Por favor introduce un prompt primero',
    },
  };

  const currentLabels = labels[language as 'en' | 'es'];

  const handleGenerateDesigns = async () => {
    if (!prompt.trim()) {
      alert(currentLabels.noPrompt);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDesigns(EXAMPLE_DESIGNS);
      setLoading(false);
    }, 2000);
  };

  const handleAddToCart = () => {
    if (!selectedDesign) {
      alert(currentLabels.selectFirst);
      return;
    }

    // Create a custom product from the design
    const customProduct = {
      id: `ai-design-${Date.now()}`,
      name_en: 'AI-Generated Sticker Pack',
      name_es: 'Paquete de Pegatinas Generado por IA',
      price: 14.99,
      category_id: 'sticker-packs',
      print_type: 'sticker',
      in_stock: true,
      image_urls: [selectedDesign],
      thumbnail_url: selectedDesign,
      short_description_en: 'Custom AI-generated sticker design',
      short_description_es: 'Diseño de pegatina personalizado generado por IA',
      material_type: 'Vinyl',
      finish_type: 'Kiss-Cut',
      is_custom: true,
    };

    addItem(customProduct, 1, { custom_logo_url: selectedDesign });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {currentLabels.title}
          </h1>
          <p className="text-xl text-gray-600">{currentLabels.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {language === 'en' ? 'Your Vision' : 'Tu Visión'}
            </h2>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentLabels.prompt}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={currentLabels.promptPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                  rows={4}
                />
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentLabels.style}
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="modern">{language === 'en' ? 'Modern' : 'Moderno'}</option>
                  <option value="retro">{language === 'en' ? 'Retro' : 'Retro'}</option>
                  <option value="minimalist">{language === 'en' ? 'Minimalist' : 'Minimalista'}</option>
                  <option value="kawaii">{language === 'en' ? 'Kawaii' : 'Kawaii'}</option>
                  <option value="gothic">{language === 'en' ? 'Gothic' : 'Gótico'}</option>
                  <option value="cyberpunk">{language === 'en' ? 'Cyberpunk' : 'Ciberpunk'}</option>
                </select>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentLabels.mood}
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="vibrant">{language === 'en' ? 'Vibrant' : 'Vibrante'}</option>
                  <option value="calm">{language === 'en' ? 'Calm' : 'Tranquilo'}</option>
                  <option value="energetic">{language === 'en' ? 'Energetic' : 'Energético'}</option>
                  <option value="dreamy">{language === 'en' ? 'Dreamy' : 'Onírico'}</option>
                  <option value="playful">{language === 'en' ? 'Playful' : 'Juguetón'}</option>
                </select>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentLabels.colors}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'multi', label: language === 'en' ? 'Multi-color' : 'Multicolor' },
                    { value: 'monochrome', label: language === 'en' ? 'Monochrome' : 'Monocromático' },
                    { value: 'pastel', label: language === 'en' ? 'Pastel' : 'Pastel' },
                    { value: 'neon', label: language === 'en' ? 'Neon' : 'Neón' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setColors(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        colors === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateDesigns}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors mt-8"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {currentLabels.generating}
                  </span>
                ) : (
                  currentLabels.generate
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {language === 'en' ? 'Design Preview' : 'Vista Previa del Diseño'}
            </h2>

            {designs.length === 0 ? (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">{currentLabels.selectDesign}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected Design */}
                {selectedDesign && (
                  <div className="relative w-full h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden border-4 border-purple-600">
                    <img
                      src={selectedDesign}
                      alt="Selected design"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Design Thumbnails */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    {language === 'en' ? 'Generated Designs:' : 'Diseños Generados:'}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {designs.map((design, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDesign(design)}
                        className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          selectedDesign === design
                            ? 'border-purple-600 ring-2 ring-purple-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={design}
                          alt={`Design ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedDesign}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                >
                  {currentLabels.addToCart}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DEPLOYMENT.md - Vercel Deployment Instructions
// ============================================================================

/*
# ViralStickerAI - Vercel Deployment Guide

## Prerequisites

1. **Git Repository**: Your project must be on GitHub, GitLab, or Bitbucket
2. **Vercel Account**: Create a free account at https://vercel.com
3. **Environment Variables**: All secrets from `.env.local`

## Step-by-Step Deployment

### 1. Connect Your Repository

```bash
# Push your code to GitHub
git add .
git commit -m "Initial commit: ViralStickerAI e-commerce"
git push origin main
```

Visit https://vercel.com/new and import your repository.

### 2. Configure Environment Variables

In Vercel Dashboard:
1. Go to **Settings > Environment Variables**
2. Add all variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SESSION_SECRET=your-session-secret
NEXT_PUBLIC_APP_URL=https://viralstickerai.com
```

### 3. Set Custom Domain

1. Go to **Settings > Domains**
2. Add your custom domain (e.g., `viralstickerai.com`)
3. Update DNS records as instructed by Vercel

### 4. Configure Build Settings

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm ci`

### 5. Deploy

Click "Deploy" - Vercel will:
1. Install dependencies
2. Build your Next.js app
3. Run tests (if configured)
4. Deploy to production

### 6. Set Up Stripe Webhook

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Create new endpoint:
   - URL: `https://viralstickerai.com/api/webhook`
   - Events: `checkout.session.completed`, `charge.refunded`
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 7. Configure Supabase

1. Update Supabase project URL and keys if needed
2. Enable Row Level Security (RLS) on all tables
3. Set up authentication if using Supabase Auth

### 8. Monitoring & Logs

Access logs in Vercel Dashboard:
1. **Deployments**: View build logs
2. **Functions**: Monitor API route execution
3. **Analytics**: Track performance metrics

## Continuous Deployment

Every push to `main` automatically:
1. Triggers a build
2. Runs pre-deployment tests
3. Deploys to staging
4. (Optionally) promotes to production

To disable, update `vercel.json` or Vercel Dashboard settings.

## Rollback

If deployment fails:
1. Go to **Deployments**
2. Select previous working deployment
3. Click "Promote to Production"

## Performance Optimization

1. **Image Optimization**: Vercel automatically optimizes images
2. **Edge Caching**: Static assets cached globally
3. **Serverless Functions**: Auto-scale API routes
4. **Analytics**: Monitor Core Web Vitals

## Security Best Practices

1. ✅ Use environment variables for all secrets
2. ✅ Enable CORS headers (configured in `next.config.mjs`)
3. ✅ Set up firewall rules in Supabase
4. ✅ Monitor Stripe webhook signatures
5. ✅ Use HTTPS only (Vercel default)
6. ✅ Enable 2FA on Vercel account

## Troubleshooting

### Build Fails
- Check build logs for errors
- Verify all environment variables are set
- Ensure Node version is compatible

### Blank Page
- Check browser console for errors
- Verify Supabase connection
- Check API route logs

### Stripe Webhook Not Firing
- Verify webhook URL is correct
- Check webhook secret in Vercel env vars
- Monitor Stripe dashboard for failed attempts

## Local Development

To test before deploying:

```bash
# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Run dev server
npm run dev

# Visit http://localhost:3000
```

## Further Reading

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Integration Guide](https://stripe.com/docs/web)
- [Supabase Hosting Guide](https://supabase.com/docs/guides/hosting)
*/
