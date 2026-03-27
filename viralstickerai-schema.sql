-- ============================================================================
-- VIRALSTICKERAI.COM - SUPABASE SCHEMA
-- Bilingual e-commerce platform for AI-assisted stickers, DTF, & sublimation
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(255) NOT NULL UNIQUE,
  name_es VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  print_type VARCHAR(50) NOT NULL CHECK (print_type IN ('sticker', 'dtf', 'sublimation')),
  description_en TEXT,
  description_es TEXT,
  icon_url VARCHAR(500),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 2. PRODUCTS TABLE (Core Product Catalog)
-- ============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id),
  brand VARCHAR(255),
  model VARCHAR(255),
  print_type VARCHAR(50) NOT NULL CHECK (print_type IN ('sticker', 'dtf', 'sublimation')),
  
  -- Pricing & Inventory
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  
  -- Images & Media
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url VARCHAR(500),
  
  -- Descriptions (Bilingual)
  short_description_en TEXT NOT NULL,
  short_description_es TEXT NOT NULL,
  long_description_en TEXT,
  long_description_es TEXT,
  
  -- Product Attributes
  material_type VARCHAR(255),
  finish_type VARCHAR(255),
  dimensions VARCHAR(255),
  weight DECIMAL(8, 3),
  
  -- Custom Capabilities
  is_custom BOOLEAN DEFAULT FALSE,
  allows_text_customization BOOLEAN DEFAULT FALSE,
  allows_logo_upload BOOLEAN DEFAULT FALSE,
  allows_color_selection BOOLEAN DEFAULT FALSE,
  
  -- AI & Tagging
  ai_prompt_en TEXT,
  ai_prompt_es TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- SEO & Metadata
  meta_description_en VARCHAR(500),
  meta_description_es VARCHAR(500),
  meta_keywords_en VARCHAR(500),
  meta_keywords_es VARCHAR(500),
  
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_print_type ON products(print_type);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_in_stock ON products(in_stock);

-- ============================================================================
-- 3. PRODUCT VARIANTS (e.g., size, color for DTF/sublimation)
-- ============================================================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_en VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  sku VARCHAR(255) NOT NULL UNIQUE,
  
  -- Pricing override
  price_override DECIMAL(10, 2),
  
  -- Variant-specific attributes (e.g., size S/M/L, color)
  attributes JSONB DEFAULT '{}'::JSONB,
  
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- ============================================================================
-- 4. USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  
  -- Authentication & Profile
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  language_preference VARCHAR(5) DEFAULT 'en' CHECK (language_preference IN ('en', 'es')),
  
  -- Shipping Address (denormalized for fast access)
  shipping_address_line1 VARCHAR(500),
  shipping_address_line2 VARCHAR(500),
  shipping_city VARCHAR(255),
  shipping_state VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(255),
  
  -- Billing Address
  billing_address_line1 VARCHAR(500),
  billing_address_line2 VARCHAR(500),
  billing_city VARCHAR(255),
  billing_state VARCHAR(255),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(255),
  billing_same_as_shipping BOOLEAN DEFAULT TRUE,
  
  -- Platform Features
  is_seller_opt_in BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 5. CART TABLE (Ephemeral shopping cart)
-- ============================================================================
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  -- Customization data
  custom_text VARCHAR(500),
  custom_logo_url VARCHAR(500),
  custom_color VARCHAR(50),
  custom_data JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE (user_id, product_id, product_variant_id)
);

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_product_id ON cart(product_id);

-- ============================================================================
-- 6. ORDERS TABLE
-- ============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Order Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Shipping
  shipping_method VARCHAR(255),
  shipping_zone VARCHAR(100),
  tracking_code VARCHAR(255),
  estimated_delivery DATE,
  
  -- Billing & Delivery
  billing_address_line1 VARCHAR(500),
  billing_address_line2 VARCHAR(500),
  billing_city VARCHAR(255),
  billing_state VARCHAR(255),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(255),
  
  shipping_address_line1 VARCHAR(500),
  shipping_address_line2 VARCHAR(500),
  shipping_city VARCHAR(255),
  shipping_state VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(255),
  
  -- Payment
  payment_method VARCHAR(100),
  payment_intent_id VARCHAR(500),
  paid_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================================================
-- 7. ORDER_ITEMS TABLE (Line items in an order)
-- ============================================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  
  -- Customization data captured at order time
  custom_text VARCHAR(500),
  custom_logo_url VARCHAR(500),
  custom_color VARCHAR(50),
  custom_data JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- 8. SHIPPING ZONES
-- ============================================================================
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name VARCHAR(255) NOT NULL UNIQUE,
  zone_name_es VARCHAR(255) NOT NULL UNIQUE,
  countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 9. SHIPPING RATES
-- ============================================================================
CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  method_name VARCHAR(255) NOT NULL,
  method_name_es VARCHAR(255) NOT NULL,
  method_key VARCHAR(100) NOT NULL,
  
  flat_rate DECIMAL(10, 2),
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_order_value DECIMAL(10, 2),
  
  estimated_days_min INT,
  estimated_days_max INT,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_shipping_rates_zone_id ON shipping_rates(zone_id);

-- ============================================================================
-- 10. HELP WIDGET CONVERSATIONS (for multi-agent chat support)
-- ============================================================================
CREATE TABLE help_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_session_id VARCHAR(500),
  
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress')),
  
  messages JSONB DEFAULT '[]'::JSONB,
  
  assigned_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_help_conversations_user_id ON help_conversations(user_id);
CREATE INDEX idx_help_conversations_session_id ON help_conversations(visitor_session_id);

-- ============================================================================
-- 11. PROMO CODES / DISCOUNTS
-- ============================================================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

-- ============================================================================
-- 12. REVIEW & RATINGS (Optional future feature)
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title_en VARCHAR(255),
  title_es VARCHAR(255),
  comment_en TEXT,
  comment_es TEXT,
  
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) for multi-tenant safety
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example: users can only see their own cart)
CREATE POLICY "Users can see own cart"
  ON cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON cart FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA: CATEGORIES (3 categories for sticker, dtf, sublimation)
-- ============================================================================
INSERT INTO categories (name_en, name_es, slug, print_type, description_en, description_es, display_order)
VALUES
  ('Sticker Packs', 'Paquetes de Pegatinas', 'sticker-packs', 'sticker',
   'Vibrant, custom-cut stickers for laptops, water bottles, and beyond.',
   'Pegatinas vibrantes y cortadas a medida para laptops, botellas de agua y más.',
   1),
  
  ('DTF Apparel', 'Ropa DTF', 'dtf-apparel', 'dtf',
   'Direct-to-Fabric printed T-shirts, tote bags, and wearables.',
   'Camisetas, bolsos de tela y prendas impresas directamente en tela.',
   2),
  
  ('Sublimation Items', 'Artículos de Sublimación', 'sublimation-items', 'sublimation',
   'Durable sublimated mugs, phone cases, and polyester garments.',
   'Tazas sublimadas duraderas, fundas de teléfono y prendas de poliéster.',
   3);

-- ============================================================================
-- SAMPLE DATA: 25 PRODUCTS (AI-themed stickers, DTF, and sublimation)
-- ============================================================================

-- STICKER PACKS (10 products)
INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'ViralStickerAI Pack 01: Futuristic Vibes',
  'Paquete ViralStickerAI 01: Vibraciones Futuristas',
  'viralstickerai-pack-01-futuristic-vibes',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  14.99, TRUE, 500,
  ARRAY['https://via.placeholder.com/400x300?text=AI+Pack+01'],
  'https://via.placeholder.com/150x150?text=AI+Pack+01',
  '15 vinyl stickers with AI-generated futuristic designs. Waterproof & durable.',
  '15 pegatinas de vinilo con diseños futuristas generados por IA. Impermeables y duraderas.',
  'Premium vinyl stickers featuring AI art, neon colors, and tech aesthetics. Perfect for tech enthusiasts.',
  'Pegatinas de vinilo premium con arte IA, colores neón y estética tecnológica. Perfectas para entusiastas de la tecnología.',
  'Vinyl', 'Waterproof',
  FALSE,
  'Generate 15 futuristic AI-themed sticker designs with neon colors, tech elements, and viral aesthetics.',
  'Genera 15 diseños de pegatinas temáticas de IA futurista con colores neón, elementos tecnológicos y estética viral.',
  ARRAY['ai', 'futuristic', 'neon', 'tech', 'vinyl']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'viralstickerai-pack-01-futuristic-vibes');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Kawaii AI Aesthetic Pack',
  'Paquete de Estética Kawaii IA',
  'kawaii-ai-aesthetic-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  12.99, TRUE, 400,
  ARRAY['https://via.placeholder.com/400x300?text=Kawaii+Pack'],
  'https://via.placeholder.com/150x150?text=Kawaii+Pack',
  '12 kiss-cut kawaii stickers. Perfect for planners, journals, and water bottles.',
  '12 pegatinas kawaii cortadas con beso. Perfectas para planificadores, diarios y botellas de agua.',
  'Cute and colorful kiss-cut stickers with kawaii characters, hearts, and sweet AI aesthetics.',
  'Pegatinas adorables y coloridas cortadas con beso con personajes kawaii, corazones y estética IA dulce.',
  'Vinyl', 'Kiss-Cut',
  FALSE,
  'Create 12 adorable kawaii-style AI stickers with pastel colors, cute characters, and sweet vibes.',
  'Crea 12 pegatinas IA estilo kawaii adorables con colores pastel, personajes lindos y vibraciones dulces.',
  ARRAY['kawaii', 'cute', 'pastel', 'aesthetic', 'kiss-cut']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'kawaii-ai-aesthetic-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Business Branding Sticker Set',
  'Conjunto de Pegatinas de Marca Empresarial',
  'business-branding-sticker-set',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  18.99, TRUE, 200,
  ARRAY['https://via.placeholder.com/400x300?text=Business+Branding'],
  'https://via.placeholder.com/150x150?text=Business+Branding',
  'Professional contour-cut stickers for small businesses. Custom branding ready.',
  'Pegatinas profesionales cortadas por contorno para pequeños negocios. Listas para marca personalizada.',
  'Contour-cut sticker set ideal for entrepreneurs and small business owners. Includes 20 premium stickers.',
  'Conjunto de pegatinas cortadas por contorno ideal para emprendedores y propietarios de pequeños negocios. Incluye 20 pegatinas premium.',
  'Premium Vinyl', 'Contour-Cut',
  FALSE,
  'Design 20 professional business branding stickers with company logos, taglines, and corporate aesthetics.',
  'Diseña 20 pegatinas profesionales de marca empresarial con logos, lemas y estética corporativa.',
  ARRAY['business', 'professional', 'branding', 'contour-cut', 'corporate']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'business-branding-sticker-set');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Quote & Motivation Planner Pack',
  'Paquete de Planificador de Citas y Motivación',
  'quote-motivation-planner-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  11.99, TRUE, 350,
  ARRAY['https://via.placeholder.com/400x300?text=Quotes+Pack'],
  'https://via.placeholder.com/150x150?text=Quotes+Pack',
  'Motivational quotes & affirmations on 18 kiss-cut stickers. Inspire your day.',
  'Citas motivacionales y afirmaciones en 18 pegatinas cortadas con beso. Inspira tu día.',
  'A collection of uplifting quotes and daily affirmations printed on kiss-cut vinyl stickers.',
  'Una colección de citas inspiradoras y afirmaciones diarias impresas en pegatinas de vinilo cortadas con beso.',
  'Vinyl', 'Kiss-Cut',
  FALSE,
  'Generate 18 motivational quote stickers with beautiful typography and inspiring messages for daily planners.',
  'Genera 18 pegatinas de citas motivacionales con tipografía hermosa y mensajes inspiradores para planificadores diarios.',
  ARRAY['quotes', 'motivation', 'affirmations', 'planner', 'kiss-cut']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'quote-motivation-planner-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Retro 80s AI Art Pack',
  'Paquete de Arte IA Retro de los 80',
  'retro-80s-ai-art-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  15.99, TRUE, 300,
  ARRAY['https://via.placeholder.com/400x300?text=Retro+80s'],
  'https://via.placeholder.com/150x150?text=Retro+80s',
  'Groovy retro 80s AI-generated designs. 14 contour-cut stickers with vintage vibes.',
  'Diseños retro groovy de los 80 generados por IA. 14 pegatinas cortadas por contorno con vibraciones vintage.',
  'Nostalgic 80s aesthetic meets AI art in this vibrant 14-sticker collection. Perfect for retro lovers.',
  'La estética nostálgica de los años 80 se encuentra con el arte IA en esta colección de 14 pegatinas vibrantes. Perfecta para amantes del retro.',
  'Vinyl', 'Contour-Cut',
  FALSE,
  'Create 14 retro 80s-inspired AI stickers with neon colors, geometric patterns, and vintage synthwave aesthetics.',
  'Crea 14 pegatinas IA inspiradas en el retro de los años 80 con colores neón, patrones geométricos y estética synthwave vintage.',
  ARRAY['retro', '80s', 'vintage', 'neon', 'synthwave']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'retro-80s-ai-art-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Galaxy & Space Explorer Pack',
  'Paquete de Explorador Galáctico y Espacial',
  'galaxy-space-explorer-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  13.99, TRUE, 280,
  ARRAY['https://via.placeholder.com/400x300?text=Galaxy+Pack'],
  'https://via.placeholder.com/150x150?text=Galaxy+Pack',
  '16 cosmic-themed AI stickers. Explore the universe with vibrant galaxy designs.',
  '16 pegatinas IA temáticas cósmicas. Explora el universo con diseños galáxicos vibrantes.',
  'Cosmic adventure awaits with 16 kiss-cut stickers featuring planets, stars, and AI-generated space art.',
  'La aventura cósmica te espera con 16 pegatinas cortadas con beso con planetas, estrellas y arte espacial generado por IA.',
  'Vinyl', 'Kiss-Cut',
  FALSE,
  'Design 16 cosmic and space-themed AI stickers with planets, stars, galaxies, and celestial wonders.',
  'Diseña 16 pegatinas IA temáticas cósmicas y espaciales con planetas, estrellas, galaxias y maravillas celestiales.',
  ARRAY['space', 'galaxy', 'cosmic', 'stars', 'universe']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'galaxy-space-explorer-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Gaming & Esports AI Pack',
  'Paquete IA de Juegos y Esports',
  'gaming-esports-ai-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  14.99, TRUE, 320,
  ARRAY['https://via.placeholder.com/400x300?text=Gaming+Pack'],
  'https://via.placeholder.com/150x150?text=Gaming+Pack',
  '20 gaming & esports stickers. Level up your laptop or gaming setup.',
  '20 pegatinas de juegos y esports. Mejora tu laptop o configuración de juegos.',
  'Gamer stickers featuring AI-generated gaming icons, esports logos, and controller artwork. 20 high-quality vinyl stickers.',
  'Pegatinas para jugadores con iconos de juegos generados por IA, logos de esports y arte de controladores. 20 pegatinas de vinilo de alta calidad.',
  'Vinyl', 'Kiss-Cut',
  FALSE,
  'Create 20 gaming and esports-themed AI stickers with controllers, game characters, and competitive gaming aesthetics.',
  'Crea 20 pegatinas IA temáticas de juegos y esports con controladores, personajes de juegos y estética competitiva.',
  ARRAY['gaming', 'esports', 'video-games', 'gamer', 'competitive']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'gaming-esports-ai-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Mental Health & Wellness Pack',
  'Paquete de Salud Mental y Bienestar',
  'mental-health-wellness-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  12.99, TRUE, 250,
  ARRAY['https://via.placeholder.com/400x300?text=Wellness+Pack'],
  'https://via.placeholder.com/150x150?text=Wellness+Pack',
  'Self-care & mental health awareness stickers. 15 kiss-cut designs for positivity.',
  'Pegatinas de autocuidado y conciencia de la salud mental. 15 diseños cortados con beso para positividad.',
  'Compassionate stickers promoting mental wellness, self-care, and positive affirmations. Perfect for mindful living.',
  'Pegatinas compasivas que promueven el bienestar mental, el autocuidado y afirmaciones positivas. Perfectas para una vida atenta.',
  'Vinyl', 'Kiss-Cut',
  FALSE,
  'Generate 15 mental health and wellness-themed stickers with positive messages, self-care icons, and calming designs.',
  'Genera 15 pegatinas temáticas de salud mental y bienestar con mensajes positivos, iconos de autocuidado y diseños calmantes.',
  ARRAY['wellness', 'mental-health', 'self-care', 'positive', 'mindfulness']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'mental-health-wellness-pack');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Nature & Botanical AI Art Pack',
  'Paquete de Arte IA Botánico y Natural',
  'nature-botanical-ai-art-pack',
  (SELECT id FROM categories WHERE slug = 'sticker-packs'),
  'sticker',
  13.99, TRUE, 220,
  ARRAY['https://via.placeholder.com/400x300?text=Botanical+Pack'],
  'https://via.placeholder.com/150x150?text=Botanical+Pack',
  'Serene botanical and nature-inspired AI designs. 14 kiss-cut eco-friendly stickers.',
  'Diseños tranquilos botánicos e inspirados en la naturaleza generados por IA. 14 pegatinas ecológicas cortadas con beso.',
  'Celebrate nature with AI-generated botanical illustrations on premium eco-friendly vinyl stickers.',
  'Celebra la naturaleza con ilustraciones botánicas generadas por IA en pegatinas de vinilo premium ecológicas.',
  'Eco-Friendly Vinyl', 'Kiss-Cut',
  FALSE,
  'Design 14 serene botanical and nature-inspired AI stickers with plants, flowers, leaves, and natural elements.',
  'Diseña 14 pegatinas IA serenas botánicas e inspiradas en la naturaleza con plantas, flores, hojas y elementos naturales.',
  ARRAY['nature', 'botanical', 'eco-friendly', 'plants', 'organic']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'nature-botanical-ai-art-pack');

-- DTF APPAREL (8 products)
INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'AI Revolution Unisex T-Shirt',
  'Camiseta Unisex Revolución IA',
  'ai-revolution-unisex-tshirt',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  24.99, TRUE, 150,
  ARRAY['https://via.placeholder.com/400x300?text=AI+Revolution+Tee'],
  'https://via.placeholder.com/150x150?text=AI+Revolution+Tee',
  'Premium DTF-printed unisex tee with bold AI graphics. Available in S-XXL.',
  'Camiseta unisex premium impresa en DTF con gráficos IA audaces. Disponible en S-XXL.',
  'High-quality DTF-printed unisex T-shirt featuring an AI-generated futuristic design. Soft, durable, and vibrant colors.',
  'Camiseta unisex de alta calidad impresa en DTF con un diseño futurista generado por IA. Suave, duradera y colores vibrantes.',
  '100% Combed Ringspun Cotton', 'DTF Print',
  FALSE, TRUE, FALSE,
  'Create a bold and inspiring AI revolution-themed graphic for a unisex t-shirt design.',
  'Crea un gráfico temático de revolución IA audaz e inspirador para el diseño de una camiseta unisex.',
  ARRAY['dtf', 'tshirt', 'ai', 'unisex', 'apparel']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ai-revolution-unisex-tshirt');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Custom DTF Tote Bag',
  'Bolsa de Tela Personalizada DTF',
  'custom-dtf-tote-bag',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  19.99, TRUE, 200,
  ARRAY['https://via.placeholder.com/400x300?text=DTF+Tote+Bag'],
  'https://via.placeholder.com/150x150?text=DTF+Tote+Bag',
  'Spacious eco-friendly tote bag with DTF custom printing. Fully customizable.',
  'Bolsa de tela ecológica espaciosa con impresión personalizada DTF. Totalmente personalizable.',
  'Large DTF-printed canvas tote bag perfect for shopping, travel, or daily use. Your design, your way.',
  'Bolsa de lona grande impresa en DTF perfecta para compras, viajes o uso diario. Tu diseño, tu forma.',
  '100% Canvas', 'DTF Print',
  TRUE, TRUE, TRUE,
  'Design a vibrant DTF print for a canvas tote bag with custom text and graphics.',
  'Diseña una impresión DTF vibrante para una bolsa de lona con texto y gráficos personalizados.',
  ARRAY['dtf', 'tote-bag', 'canvas', 'custom', 'eco-friendly']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'custom-dtf-tote-bag');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Vibe Check Oversized DTF Hoodie',
  'Sudadera Oversized DTF Vibe Check',
  'vibe-check-oversized-dtf-hoodie',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  44.99, TRUE, 80,
  ARRAY['https://via.placeholder.com/400x300?text=DTF+Hoodie'],
  'https://via.placeholder.com/150x150?text=DTF+Hoodie',
  'Cozy oversized hoodie with eye-catching DTF print. Perfect for chilly days.',
  'Sudadera acogedora oversized con impresión DTF llamativa. Perfecta para días fríos.',
  'Premium oversized hoodie featuring a high-quality DTF print design. Comfortable, stylish, and warm.',
  'Sudadera premium oversized con un diseño de impresión DTF de alta calidad. Cómoda, elegante y cálida.',
  '80/20 Fleece Blend', 'DTF Print',
  FALSE, TRUE, FALSE,
  'Design a trendy and eye-catching DTF graphic suitable for an oversized hoodie.',
  'Diseña un gráfico DTF de moda y llamativo adecuado para una sudadera oversized.',
  ARRAY['dtf', 'hoodie', 'apparel', 'casual', 'comfortable']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'vibe-check-oversized-dtf-hoodie');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'DTF Women''s Fitted V-Neck',
  'Camiseta Ajustada de Cuello en V para Mujeres DTF',
  'dtf-womens-fitted-vneck',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  22.99, TRUE, 120,
  ARRAY['https://via.placeholder.com/400x300?text=Womens+DTF+Tee'],
  'https://via.placeholder.com/150x150?text=Womens+DTF+Tee',
  'Flattering fitted V-neck tee with premium DTF print. Sizes XS-XXL.',
  'Camiseta de cuello en V ajustada favorecedora con impresión DTF premium. Tallas XS-XXL.',
  'Stylish women''s fitted V-neck T-shirt with vibrant DTF-printed artwork. Perfect fit and premium quality.',
  'Camiseta ajustada de cuello en V para mujeres elegante con arte impreso en DTF vibrante. Ajuste perfecto y calidad premium.',
  '100% Combed Ringspun Cotton', 'DTF Print',
  FALSE, TRUE, FALSE,
  'Create a stylish and flattering DTF design for a women''s fitted V-neck tee.',
  'Crea un diseño DTF elegante y favorecedora para una camiseta ajustada de cuello en V para mujeres.',
  ARRAY['dtf', 'tshirt', 'womens', 'fitted', 'vneck']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'dtf-womens-fitted-vneck');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'DTF Crew Neck Sweatshirt',
  'Sudadera de Cuello Redondo DTF',
  'dtf-crew-neck-sweatshirt',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  39.99, TRUE, 90,
  ARRAY['https://via.placeholder.com/400x300?text=Crew+Sweatshirt'],
  'https://via.placeholder.com/150x150?text=Crew+Sweatshirt',
  'Comfortable crew neck sweatshirt with bold DTF artwork. Unisex sizing.',
  'Sudadera de cuello redondo cómoda con arte DTF audaz. Tallas unisex.',
  'Soft and warm crew neck sweatshirt featuring premium DTF printing. Ideal for layering and casual comfort.',
  'Sudadera suave y cálida de cuello redondo con impresión DTF premium. Ideal para capas y comodidad casual.',
  '70/30 Cotton/Polyester Blend', 'DTF Print',
  FALSE, TRUE, FALSE,
  'Design a bold and inspiring DTF print for a unisex crew neck sweatshirt.',
  'Diseña una impresión DTF audaz e inspiradora para una sudadera de cuello redondo unisex.',
  ARRAY['dtf', 'sweatshirt', 'crewneck', 'casual', 'comfortable']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'dtf-crew-neck-sweatshirt');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Custom DTF Trucker Hat',
  'Gorra de Camionero Personalizada DTF',
  'custom-dtf-trucker-hat',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  21.99, TRUE, 110,
  ARRAY['https://via.placeholder.com/400x300?text=DTF+Trucker+Hat'],
  'https://via.placeholder.com/150x150?text=DTF+Trucker+Hat',
  'Classic trucker hat with custom DTF print on front. Mesh back for comfort.',
  'Gorra de camionero clásica con impresión DTF personalizada en la parte delantera. Espalda de malla para comodidad.',
  'Adjustable trucker hat with mesh back ventilation. Premium DTF print on the front panel. Customize your design.',
  'Gorra de camionero ajustable con ventilación de malla en la espalda. Impresión DTF premium en el panel frontal. Personaliza tu diseño.',
  '100% Cotton/Polyester Blend', 'DTF Print',
  TRUE, FALSE, TRUE,
  'Design a bold DTF print for a trucker hat front panel with text or logos.',
  'Diseña una impresión DTF audaz para el panel frontal de una gorra de camionero con texto o logos.',
  ARRAY['dtf', 'hat', 'trucker', 'custom', 'apparel']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'custom-dtf-trucker-hat');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Premium DTF Long Sleeve',
  'Camiseta DTF de Manga Larga Premium',
  'premium-dtf-long-sleeve',
  (SELECT id FROM categories WHERE slug = 'dtf-apparel'),
  'dtf',
  27.99, TRUE, 100,
  ARRAY['https://via.placeholder.com/400x300?text=Long+Sleeve+DTF'],
  'https://via.placeholder.com/150x150?text=Long+Sleeve+DTF',
  'Premium long-sleeve DTF shirt with premium cotton blend. Perfect for all seasons.',
  'Camiseta DTF de manga larga premium con mezcla de algodón premium. Perfecta para todas las estaciones.',
  'Premium long-sleeve shirt featuring high-quality DTF printing. Soft cotton blend, perfect for layering or wearing alone.',
  'Camiseta de manga larga premium con impresión DTF de alta calidad. Mezcla suave de algodón, perfecta para capas o usar sola.',
  '100% Combed Ringspun Cotton', 'DTF Print',
  FALSE, TRUE, FALSE,
  'Create a striking DTF design for a premium long-sleeve shirt suitable for any occasion.',
  'Crea un diseño DTF impactante para una camiseta de manga larga premium adecuada para cualquier ocasión.',
  ARRAY['dtf', 'longsleeve', 'tshirt', 'premium', 'apparel']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'premium-dtf-long-sleeve');

-- SUBLIMATION ITEMS (7 products)
INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'AI-Powered Coffee Mug',
  'Taza de Café Impulsada por IA',
  'ai-powered-coffee-mug',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  12.99, TRUE, 200,
  ARRAY['https://via.placeholder.com/400x300?text=AI+Mug'],
  'https://via.placeholder.com/150x150?text=AI+Mug',
  'Beautiful sublimated ceramic mug with full-wrap AI art design. Microwave & dishwasher safe.',
  'Hermosa taza de cerámica sublimada con diseño de arte IA de envolvimiento completo. Segura para microondas y lavavajillas.',
  'Premium ceramic mug with stunning full-wrap sublimated design. Perfect for gifting or personal use. Heat-resistant and durable.',
  'Taza de cerámica premium con un diseño sublimado de envolvimiento completo impresionante. Perfecta para regalar o uso personal. Resistente al calor y duradera.',
  'Ceramic', 'Sublimation Print',
  FALSE, FALSE, FALSE,
  'Design a full-wrap AI-art pattern for a ceramic coffee mug with vibrant colors and intricate details.',
  'Diseña un patrón de arte IA de envolvimiento completo para una taza de café de cerámica con colores vibrantes y detalles intrincados.',
  ARRAY['sublimation', 'mug', 'coffee', 'ceramic', 'drinkware']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ai-powered-coffee-mug');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Custom Sublimated Phone Case',
  'Funda de Teléfono Sublimada Personalizada',
  'custom-sublimated-phone-case',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  16.99, TRUE, 180,
  ARRAY['https://via.placeholder.com/400x300?text=Phone+Case'],
  'https://via.placeholder.com/150x150?text=Phone+Case',
  'Durable sublimated phone case. Available for all major phone models. Full custom design.',
  'Funda de teléfono sublimada duradera. Disponible para todos los modelos de teléfono principales. Diseño totalmente personalizado.',
  'Protective phone case with custom sublimated design. Fits most smartphone models. Durable, fade-resistant finish.',
  'Funda de teléfono protectora con diseño sublimado personalizado. Se ajusta a la mayoría de modelos de smartphones. Acabado duradero y resistente al desvanecimiento.',
  'TPU/Polycarbonate', 'Sublimation Print',
  TRUE, FALSE, TRUE,
  'Create a unique sublimated design for a phone case that protects and personalizes your device.',
  'Crea un diseño sublimado único para una funda de teléfono que proteja y personalice tu dispositivo.',
  ARRAY['sublimation', 'phone-case', 'custom', 'protective', 'tech']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'custom-sublimated-phone-case');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Sublimated Polyester T-Shirt',
  'Camiseta de Poliéster Sublimada',
  'sublimated-polyester-tshirt',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  21.99, TRUE, 140,
  ARRAY['https://via.placeholder.com/400x300?text=Polyester+Tee'],
  'https://via.placeholder.com/150x150?text=Polyester+Tee',
  'All-over sublimated polyester T-shirt with vibrant, permanent color. High-quality finish.',
  'Camiseta de poliéster sublimada por todas partes con color vibrante y permanente. Acabado de alta calidad.',
  'Premium sublimated polyester T-shirt featuring full-color, all-over design. Perfect for athletes and active wear enthusiasts.',
  'Camiseta de poliéster sublimada premium con diseño a todo color y por todas partes. Perfecta para atletas y entusiastas del deporte.',
  '100% Polyester Mesh', 'Sublimation Print',
  FALSE, FALSE, FALSE,
  'Design an all-over sublimated pattern for a polyester athletic t-shirt with vibrant and energetic aesthetics.',
  'Diseña un patrón sublimado por todas partes para una camiseta de poliéster atlética con estética vibrante y energética.',
  ARRAY['sublimation', 'tshirt', 'polyester', 'athletic', 'activewear']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sublimated-polyester-tshirt');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Personalized Sublimated Water Bottle',
  'Botella de Agua Sublimada Personalizada',
  'personalized-sublimated-water-bottle',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  18.99, TRUE, 160,
  ARRAY['https://via.placeholder.com/400x300?text=Water+Bottle'],
  'https://via.placeholder.com/150x150?text=Water+Bottle',
  'Stainless steel water bottle with full-wrap sublimated design. Leak-proof & durable.',
  'Botella de agua de acero inoxidable con diseño sublimado de envolvimiento completo. A prueba de fugas y duradera.',
  'Premium stainless steel water bottle featuring custom sublimated wrap design. Keeps drinks cold or hot for hours.',
  'Botella de agua de acero inoxidable premium con diseño de envolvimiento sublimado personalizado. Mantiene las bebidas frías o calientes durante horas.',
  'Stainless Steel', 'Sublimation Print',
  TRUE, FALSE, TRUE,
  'Create a custom sublimated design for a water bottle that''s both functional and visually stunning.',
  'Crea un diseño sublimado personalizado para una botella de agua que sea funcional y visualmente impresionante.',
  ARRAY['sublimation', 'water-bottle', 'drinkware', 'custom', 'hydration']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'personalized-sublimated-water-bottle');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Sublimated Mousepad',
  'Alfombrilla de Ratón Sublimada',
  'sublimated-mousepad',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  13.99, TRUE, 220,
  ARRAY['https://via.placeholder.com/400x300?text=Mousepad'],
  'https://via.placeholder.com/150x150?text=Mousepad',
  'Large sublimated mousepad with non-slip base. Perfect for gaming or office use.',
  'Alfombrilla de ratón grande sublimada con base antideslizante. Perfecta para juegos u oficina.',
  'Premium sublimated mousepad with full-color custom design and non-slip rubber base. Perfect for any desk setup.',
  'Alfombrilla de ratón sublimada premium con diseño personalizado a todo color y base de goma antideslizante. Perfecta para cualquier configuración de escritorio.',
  'Cloth Top/Rubber Base', 'Sublimation Print',
  FALSE, FALSE, FALSE,
  'Design a full-color sublimated mousepad with AI art, gaming themes, or custom branding.',
  'Diseña una alfombrilla de ratón sublimada a todo color con arte IA, temas de juegos o marca personalizada.',
  ARRAY['sublimation', 'mousepad', 'gaming', 'office', 'tech']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sublimated-mousepad');

INSERT INTO products (
  name_en, name_es, slug, category_id, print_type,
  price, in_stock, stock_quantity,
  image_urls, thumbnail_url,
  short_description_en, short_description_es,
  long_description_en, long_description_es,
  material_type, finish_type, is_custom, allows_color_selection, allows_text_customization,
  ai_prompt_en, ai_prompt_es,
  tags
)
SELECT
  'Sublimated Ceramic Tile',
  'Azulejo de Cerámica Sublimado',
  'sublimated-ceramic-tile',
  (SELECT id FROM categories WHERE slug = 'sublimation-items'),
  'sublimation',
  14.99, TRUE, 130,
  ARRAY['https://via.placeholder.com/400x300?text=Ceramic+Tile'],
  'https://via.placeholder.com/150x150?text=Ceramic+Tile',
  'Beautiful ceramic tile with sublimated art design. Perfect for home décor or gifts.',
  'Hermoso azulejo de cerámica con diseño de arte sublimado. Perfecto para decoración del hogar o regalos.',
  'Premium ceramic tile featuring stunning sublimated artwork. Use as coaster, wall décor, or decorative accent.',
  'Azulejo de cerámica premium con arte sublimado impresionante. Úsalo como posavasos, decoración de pared o acento decorativo.',
  'Ceramic', 'Sublimation Print',
  FALSE, FALSE, FALSE,
  'Design intricate sublimated artwork for a ceramic tile suitable for home décor or as a decorative coaster.',
  'Diseña arte sublimado intrincado para un azulejo de cerámica adecuado para decoración del hogar o como posavasos decorativo.',
  ARRAY['sublimation', 'tile', 'ceramic', 'home-decor', 'gift']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sublimated-ceramic-tile');

-- ============================================================================
-- SAMPLE DATA: SHIPPING ZONES
-- ============================================================================
INSERT INTO shipping_zones (zone_name, zone_name_es, countries)
VALUES
  ('USA Domestic', 'USA Doméstico', ARRAY['US']),
  ('Canada', 'Canadá', ARRAY['CA']),
  ('International', 'Internacional', ARRAY['GB', 'AU', 'DE', 'FR', 'JP', 'MX', 'BR']);

-- ============================================================================
-- SAMPLE DATA: SHIPPING RATES
-- ============================================================================
INSERT INTO shipping_rates (zone_id, method_name, method_name_es, method_key, flat_rate, estimated_days_min, estimated_days_max, is_active)
SELECT
  (SELECT id FROM shipping_zones WHERE zone_name = 'USA Domestic'),
  'Standard (5-7 Business Days)',
  'Estándar (5-7 Días Hábiles)',
  'usps-standard',
  5.99,
  5,
  7,
  TRUE;

INSERT INTO shipping_rates (zone_id, method_name, method_name_es, method_key, flat_rate, estimated_days_min, estimated_days_max, is_active)
SELECT
  (SELECT id FROM shipping_zones WHERE zone_name = 'USA Domestic'),
  'Express (2-3 Business Days)',
  'Express (2-3 Días Hábiles)',
  'usps-express',
  14.99,
  2,
  3,
  TRUE;

INSERT INTO shipping_rates (zone_id, method_name, method_name_es, method_key, flat_rate, estimated_days_min, estimated_days_max, is_active)
SELECT
  (SELECT id FROM shipping_zones WHERE zone_name = 'Canada'),
  'Standard (7-10 Business Days)',
  'Estándar (7-10 Días Hábiles)',
  'canada-standard',
  12.99,
  7,
  10,
  TRUE;

INSERT INTO shipping_rates (zone_id, method_name, method_name_es, method_key, flat_rate, estimated_days_min, estimated_days_max, is_active)
SELECT
  (SELECT id FROM shipping_zones WHERE zone_name = 'International'),
  'International Standard (14-21 Days)',
  'Estándar Internacional (14-21 Días)',
  'intl-standard',
  24.99,
  14,
  21,
  TRUE;

-- ============================================================================
-- SAMPLE DATA: PROMO CODES
-- ============================================================================
INSERT INTO promo_codes (code, description_en, description_es, discount_type, discount_value, min_order_value, valid_until, is_active)
VALUES
  ('VIRAL10', 'Save 10% off your order', 'Ahorra 10% en tu pedido', 'percentage', 10, 0, NOW() + INTERVAL '90 days', TRUE),
  ('WELCOME15', 'New customers: 15% off', 'Nuevos clientes: 15% de descuento', 'percentage', 15, 25, NOW() + INTERVAL '60 days', TRUE),
  ('FREESHIP', 'Free shipping on orders over $50', 'Envío gratuito en pedidos superiores a $50', 'fixed', 5.99, 50, NOW() + INTERVAL '30 days', TRUE);

-- ============================================================================
-- VERIFY DATA INSERTED
-- ============================================================================
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Shipping Zones' as table_name, COUNT(*) as count FROM shipping_zones
UNION ALL
SELECT 'Shipping Rates' as table_name, COUNT(*) as count FROM shipping_rates
UNION ALL
SELECT 'Promo Codes' as table_name, COUNT(*) as count FROM promo_codes;
