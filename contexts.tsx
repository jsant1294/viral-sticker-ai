// context/LanguageContext.tsx
/**
 * Language Context Provider
 * Manages EN/ES language preferences across the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object (simplified; would be expanded in production)
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.stickers': 'Stickers',
    'nav.dtf': 'DTF Apparel',
    'nav.sublimation': 'Sublimation',
    'nav.cart': 'Cart',
    'nav.help': 'Help',
    'nav.account': 'Account',
    'cart.empty': 'Your cart is empty',
    'cart.addItem': 'Add to Cart',
    'cart.checkout': 'Proceed to Checkout',
    'checkout.billing': 'Billing Address',
    'checkout.shipping': 'Shipping Address',
    'checkout.payment': 'Payment',
    'checkout.summary': 'Order Summary',
    'product.price': 'Price',
    'product.stock': 'In Stock',
    'product.customizable': 'Customizable',
    'help.title': 'How can we help?',
    'help.placeholder': 'Ask a question...',
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.delete': 'Delete',
    'error.generic': 'Something went wrong. Please try again.',
    'success.added': 'Item added to cart!',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.stickers': 'Pegatinas',
    'nav.dtf': 'Ropa DTF',
    'nav.sublimation': 'Sublimación',
    'nav.cart': 'Carrito',
    'nav.help': 'Ayuda',
    'nav.account': 'Cuenta',
    'cart.empty': 'Tu carrito está vacío',
    'cart.addItem': 'Añadir al Carrito',
    'cart.checkout': 'Proceder al Pago',
    'checkout.billing': 'Dirección de Facturación',
    'checkout.shipping': 'Dirección de Envío',
    'checkout.payment': 'Pago',
    'checkout.summary': 'Resumen del Pedido',
    'product.price': 'Precio',
    'product.stock': 'En Stock',
    'product.customizable': 'Personalizable',
    'help.title': '¿Cómo podemos ayudarte?',
    'help.placeholder': 'Haz una pregunta...',
    'button.submit': 'Enviar',
    'button.cancel': 'Cancelar',
    'button.save': 'Guardar',
    'button.delete': 'Eliminar',
    'error.generic': 'Algo salió mal. Intenta de nuevo.',
    'success.added': '¡Artículo añadido al carrito!',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
      setLanguageState(saved || browserLang);
      setMounted(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // Simple translation function with fallback
  const t = (key: string, lang: Language = language): string => {
    return translations[lang]?.[key] || key;
  };

  // Don't render until client-side is ready
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// ============================================================================
// CartContext.tsx
// ============================================================================
/**
 * Cart Context Provider
 * Manages shopping cart state and operations
 */

interface CartContextType {
  items: any[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  addItem: (product: any, quantity?: number, customization?: any) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<boolean>;
  calculateTotals: () => void;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load cart from localStorage:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const calculateTotals = () => {
    const newSubtotal = items.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);

    setSubtotal(newSubtotal);

    // Simple tax calculation (8%)
    const newTax = newSubtotal * 0.08;
    setTax(newTax);
  };

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const addItem = async (product: any, quantity: number = 1, customization?: any) => {
    setLoading(true);
    setError(null);

    try {
      const existingIndex = items.findIndex(
        (item) => item.product_id === product.id && item.variant_id === customization?.variant_id
      );

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...items];
        updated[existingIndex].quantity += quantity;
        setItems(updated);
      } else {
        // Add new item
        setItems([
          ...items,
          {
            product_id: product.id,
            product,
            quantity,
            ...customization,
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string, variantId?: string) => {
    setLoading(true);
    setError(null);

    try {
      setItems(
        items.filter(
          (item) =>
            !(item.product_id === productId && (!variantId || item.variant_id === variantId))
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variantId?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (quantity <= 0) {
        await removeItem(productId, variantId);
      } else {
        setItems(
          items.map((item) =>
            item.product_id === productId && (!variantId || item.variant_id === variantId)
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);

    try {
      setItems([]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = async (code: string): Promise<boolean> => {
    try {
      // Call API to validate promo code
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      // Apply discount based on response
      if (data.discount_type === 'percentage') {
        const discountAmount = subtotal * (data.discount_value / 100);
        setTax(subtotal * 0.08); // Recalculate tax
      } else {
        // Fixed discount
        setTax(Math.max(0, subtotal * 0.08)); // Ensure non-negative
      }

      return true;
    } catch (err) {
      console.error('Failed to apply promo code:', err);
      return false;
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal + shippingCost + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingCost,
        tax,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromoCode,
        calculateTotals,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// ============================================================================
// AuthContext.tsx
// ============================================================================
/**
 * Authentication Context Provider
 * Manages user authentication state
 */

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to check auth:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
