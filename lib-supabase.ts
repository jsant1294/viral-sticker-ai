// lib/supabase.ts
/**
 * Supabase Client Setup for ViralStickerAI
 * Handles database connections, real-time subscriptions, and auth
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// ============================================================================
// CLIENT-SIDE SUPABASE CLIENT (for browser use)
// ============================================================================
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-app-version': '1.0.0',
    },
  },
});

// ============================================================================
// SERVER-SIDE SUPABASE CLIENT (for API routes and server components)
// ============================================================================
export const supabaseServer = () => {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server operations');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// ============================================================================
// PRODUCT QUERIES
// ============================================================================
export const productQueries = {
  // Get all products with optional filtering
  async getProducts(
    filters?: {
      print_type?: string;
      category_id?: string;
      min_price?: number;
      max_price?: number;
      in_stock_only?: boolean;
      search?: string;
      sort_by?: string;
      page?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (filters?.print_type) {
      query = query.eq('print_type', filters.print_type);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.min_price) {
      query = query.gte('price', filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte('price', filters.max_price);
    }

    if (filters?.in_stock_only) {
      query = query.eq('in_stock', true);
    }

    if (filters?.search) {
      query = query.or(
        `name_en.ilike.%${filters.search}%,name_es.ilike.%${filters.search}%`
      );
    }

    // Sorting
    if (filters?.sort_by === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (filters?.sort_by === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const start = (page - 1) * limit;

    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  // Get single product by ID
  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch product: ${error.message}`);
    return data;
  },

  // Get product by slug
  async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('slug', slug)
      .single();

    if (error) throw new Error(`Failed to fetch product: ${error.message}`);
    return data;
  },

  // Get products by category
  async getProductsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('in_stock', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return data || [];
  },
};

// ============================================================================
// CATEGORY QUERIES
// ============================================================================
export const categoryQueries = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return data || [];
  },

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw new Error(`Failed to fetch category: ${error.message}`);
    return data;
  },

  // Get categories by print type
  async getCategoriesByPrintType(printType: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('print_type', printType)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return data || [];
  },
};

// ============================================================================
// SHIPPING QUERIES
// ============================================================================
export const shippingQueries = {
  // Get shipping rates for a zone
  async getShippingRates(country: string) {
    // First find the zone for this country
    const { data: zoneData, error: zoneError } = await supabase
      .from('shipping_zones')
      .select('id')
      .contains('countries', [country])
      .single();

    if (zoneError && zoneError.code !== 'PGRST116') {
      // Fallback to 'International' zone
      return shippingQueries.getShippingRatesForZone('international');
    }

    if (!zoneData) {
      return shippingQueries.getShippingRatesForZone('international');
    }

    return shippingQueries.getShippingRatesForZone(zoneData.id);
  },

  // Get shipping rates for specific zone
  async getShippingRatesForZone(zoneId: string) {
    const { data, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('is_active', true)
      .order('flat_rate', { ascending: true });

    if (error) throw new Error(`Failed to fetch shipping rates: ${error.message}`);
    return data || [];
  },

  // Get all zones
  async getShippingZones() {
    const { data, error } = await supabase
      .from('shipping_zones')
      .select('*');

    if (error) throw new Error(`Failed to fetch zones: ${error.message}`);
    return data || [];
  },
};

// ============================================================================
// CART QUERIES
// ============================================================================
export const cartQueries = {
  // Get user's cart
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to fetch cart: ${error.message}`);
    return data || [];
  },

  // Add item to cart
  async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1,
    customization?: {
      custom_text?: string;
      custom_logo_url?: string;
      custom_color?: string;
      product_variant_id?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('cart')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity,
          product_variant_id: customization?.product_variant_id,
          custom_text: customization?.custom_text,
          custom_logo_url: customization?.custom_logo_url,
          custom_color: customization?.custom_color,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,product_id,product_variant_id',
        }
      )
      .select();

    if (error) throw new Error(`Failed to add to cart: ${error.message}`);
    return data?.[0];
  },

  // Update cart item quantity
  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ) {
    let query = supabase
      .from('cart')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('product_variant_id', variantId);
    }

    const { data, error } = await query.select();

    if (error) throw new Error(`Failed to update cart: ${error.message}`);
    return data;
  },

  // Remove from cart
  async removeFromCart(
    userId: string,
    productId: string,
    variantId?: string
  ) {
    let query = supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('product_variant_id', variantId);
    }

    const { error } = await query;

    if (error) throw new Error(`Failed to remove from cart: ${error.message}`);
  },

  // Clear entire cart
  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  },
};

// ============================================================================
// ORDER QUERIES
// ============================================================================
export const orderQueries = {
  // Get user's orders
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return data || [];
  },

  // Get order by ID
  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return data;
  },

  // Get order by number
  async getOrderByNumber(orderNumber: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return data;
  },

  // Create order
  async createOrder(orderData: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    return data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);
    return data;
  },
};

// ============================================================================
// PROMO CODE QUERIES
// ============================================================================
export const promoCodes = {
  // Validate promo code
  async validatePromoCode(code: string) {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) return null;

    // Check expiration
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return null;
    }

    // Check max uses
    if (data.max_uses && data.used_count >= data.max_uses) {
      return null;
    }

    return data;
  },

  // Increment usage count
  async incrementUsageCount(promoCodeId: string) {
    const { error } = await supabase
      .from('promo_codes')
      .update({ used_count: supabase.rpc('increment_used_count', { id: promoCodeId }) })
      .eq('id', promoCodeId);

    if (error) throw new Error(`Failed to update promo code: ${error.message}`);
  },
};

export default supabase;
