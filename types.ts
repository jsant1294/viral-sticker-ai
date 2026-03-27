// types/index.ts
/**
 * Central type definitions for ViralStickerAI
 * Includes Product, Order, User, and API types
 */

export type Language = 'en' | 'es';

export type PrintType = 'sticker' | 'dtf' | 'sublimation';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// ============================================================================
// PRODUCT TYPES
// ============================================================================
export interface Category {
  id: string;
  name_en: string;
  name_es: string;
  slug: string;
  print_type: PrintType;
  description_en: string;
  description_es: string;
  icon_url?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name_en: string;
  name_es: string;
  sku: string;
  price_override?: number;
  attributes: Record<string, any>;
  in_stock: boolean;
  stock_quantity: number;
  created_at: string;
}

export interface Product {
  id: string;
  name_en: string;
  name_es: string;
  slug: string;
  category_id: string;
  category?: Category;
  brand?: string;
  model?: string;
  print_type: PrintType;
  price: number;
  currency: string;
  in_stock: boolean;
  stock_quantity: number;
  image_urls: string[];
  thumbnail_url?: string;
  short_description_en: string;
  short_description_es: string;
  long_description_en?: string;
  long_description_es?: string;
  material_type?: string;
  finish_type?: string;
  dimensions?: string;
  weight?: number;
  is_custom: boolean;
  allows_text_customization: boolean;
  allows_logo_upload: boolean;
  allows_color_selection: boolean;
  ai_prompt_en?: string;
  ai_prompt_es?: string;
  tags: string[];
  meta_description_en?: string;
  meta_description_es?: string;
  meta_keywords_en?: string;
  meta_keywords_es?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

// ============================================================================
// CART TYPES
// ============================================================================
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  product_variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  custom_text?: string;
  custom_logo_url?: string;
  custom_color?: string;
  custom_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

// ============================================================================
// USER TYPES
// ============================================================================
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  language_preference: Language;
  shipping_address?: Address;
  billing_address?: Address;
  billing_same_as_shipping: boolean;
  is_seller_opt_in: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ============================================================================
// SHIPPING TYPES
// ============================================================================
export interface ShippingZone {
  id: string;
  zone_name: string;
  zone_name_es: string;
  countries: string[];
  description?: string;
  created_at: string;
}

export interface ShippingRate {
  id: string;
  zone_id: string;
  method_name: string;
  method_name_es: string;
  method_key: string;
  flat_rate: number;
  min_order_value: number;
  max_order_value?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  product_variant_id?: string;
  quantity: number;
  unit_price: number;
  custom_text?: string;
  custom_logo_url?: string;
  custom_color?: string;
  custom_data?: Record<string, any>;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  user?: User;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total_amount: number;
  currency: string;
  shipping_method?: string;
  shipping_zone?: string;
  tracking_code?: string;
  estimated_delivery?: string;
  billing_address: Address;
  shipping_address: Address;
  payment_method?: string;
  payment_intent_id?: string;
  paid_at?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROMO CODE TYPES
// ============================================================================
export interface PromoCode {
  id: string;
  code: string;
  description_en: string;
  description_es: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// HELP WIDGET TYPES
// ============================================================================
export interface HelpMessage {
  id: string;
  sender_type: 'user' | 'agent';
  agent_type?: 'product_specialist' | 'shipping_specialist' | 'technical_support' | 'general';
  message_en?: string;
  message_es?: string;
  timestamp: string;
}

export interface HelpConversation {
  id: string;
  user_id?: string;
  visitor_session_id?: string;
  subject: string;
  status: 'open' | 'closed' | 'in_progress';
  messages: HelpMessage[];
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title_en?: string;
  title_es?: string;
  comment_en?: string;
  comment_es?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// CHECKOUT TYPES
// ============================================================================
export interface CheckoutSession {
  order_id: string;
  session_id: string;
  client_secret?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CreateOrderPayload {
  user_id: string;
  items: {
    product_id: string;
    product_variant_id?: string;
    quantity: number;
    custom_text?: string;
    custom_logo_url?: string;
    custom_color?: string;
  }[];
  shipping_address: Address;
  billing_address?: Address;
  billing_same_as_shipping: boolean;
  shipping_method: string;
  promo_code?: string;
  notes?: string;
}

export interface StripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      object: string;
      amount: number;
      currency: string;
      metadata?: Record<string, any>;
      payment_intent?: string;
      status?: string;
    };
  };
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================
export interface ProductFilters {
  print_type?: PrintType;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  tags?: string[];
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// ============================================================================
// CUSTOMIZATION TYPES
// ============================================================================
export interface ProductCustomization {
  product_id: string;
  custom_text?: string;
  custom_logo_url?: string;
  custom_color?: string;
  custom_data?: Record<string, any>;
}

// ============================================================================
// AI DESIGNER TYPES
// ============================================================================
export interface AIDesignerPrompt {
  prompt_en: string;
  prompt_es: string;
  style?: string;
  colors?: string[];
  mood?: string;
  use_ai: boolean;
}

export interface AIDesignerResult {
  design_id: string;
  image_url: string;
  prompt_used: AIDesignerPrompt;
  created_at: string;
  can_add_to_cart: boolean;
}
