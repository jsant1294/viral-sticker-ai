
'use client';
// components/layout/LanguageToggle.tsx
/**
 * Language Toggle Component (EN/ES)
 * Compact selector for switching between English and Spanish
 */

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/types';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 border border-gray-300 rounded-lg hover:border-purple-600 transition-colors"
      >
        <span>{languages.find((l) => l.code === language)?.flag}</span>
        <span className="hidden sm:inline">
          {languages.find((l) => l.code === language)?.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === lang.code
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// components/product/ProductCard.tsx
// ============================================================================
/**
 * Product Card Component
 * Displays individual product in grid with image, name, price, and add to cart
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onCustomize?: (product: Product) => void;
}

export default function ProductCard({ product, onCustomize }: ProductCardProps) {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const name = language === 'en' ? product.name_en : product.name_es;
  const description = language === 'en' ? product.short_description_en : product.short_description_es;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.is_custom || product.allows_text_customization || product.allows_logo_upload) {
      // Open customization panel if product is customizable
      onCustomize?.(product);
    } else {
      // Add to cart directly
      setLoading(true);
      try {
        await addItem(product, 1);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 bg-gray-200 overflow-hidden">
          {product.thumbnail_url || product.image_urls?.[0] ? (
            <Image
              src={product.thumbnail_url || product.image_urls[0]}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
            </div>
          )}

          {/* Badge for print type */}
          <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {product.print_type === 'sticker' && '🎨'}
            {product.print_type === 'dtf' && '👕'}
            {product.print_type === 'sublimation' && '☕'}
          </div>

          {/* Stock status */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {language === 'en' ? 'Out of Stock' : 'Agotado'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-1">
            {name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>

          {/* Attributes */}
          <div className="text-xs text-gray-500 mb-3">
            {product.material_type && <span>{product.material_type}</span>}
            {product.material_type && product.finish_type && <span> • </span>}
            {product.finish_type && <span>{product.finish_type}</span>}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price and Button */}
          <div className="mt-auto space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-bold text-purple-600">
                ${product.price.toFixed(2)}
              </span>
              {product.currency !== 'USD' && (
                <span className="text-xs text-gray-500">{product.currency}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || loading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                product.in_stock
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              ) : product.in_stock ? (
                language === 'en' ? (
                  'Add to Cart'
                ) : (
                  'Añadir al Carrito'
                )
              ) : (
                language === 'en' ? (
                  'Unavailable'
                ) : (
                  'No Disponible'
                )
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// components/product/ProductGrid.tsx
// ============================================================================
/**
 * Product Grid Component
 * Displays multiple products in a responsive grid layout
 */

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onCustomize?: (product: Product) => void;
}

export function ProductGrid({ products, loading = false, onCustomize }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCustomize={onCustomize}
        />
      ))}
    </div>
  );
}
