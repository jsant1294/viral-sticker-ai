// components/cart/CartWidget.tsx
/**
 * Shopping Cart Sidebar/Modal
 * Displays cart items, totals, and checkout button
 */


// 'use client' directive already at the top

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface CartWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartWidget({ isOpen, onClose }: CartWidgetProps) {
  const { language, t } = useLanguage();
  const { items, subtotal, shippingCost, tax, total, removeItem, updateQuantity, loading } = useCart();

  const emptyText = language === 'en' ? 'Your cart is empty' : 'Tu carrito está vacío';
  const checkoutText = language === 'en' ? 'Proceed to Checkout' : 'Proceder al Pago';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'en' ? 'Shopping Cart' : 'Carrito de Compras'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">{emptyText}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.product_id}-${item.variant_id || ''}`}
                    item={item}
                    language={language}
                    onRemove={() => removeItem(item.product_id, item.variant_id)}
                    onUpdateQuantity={(qty) =>
                      updateQuantity(item.product_id, qty, item.variant_id)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          {items.length > 0 && <div className="border-t border-gray-200" />}

          {/* Summary */}
          {items.length > 0 && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>{language === 'en' ? 'Subtotal' : 'Subtotal'}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{language === 'en' ? 'Tax' : 'Impuesto'}</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{language === 'en' ? 'Shipping' : 'Envío'}</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">{language === 'en' ? 'Total' : 'Total'}</span>
                <span className="font-bold text-lg text-purple-600">${total.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-center"
              >
                {checkoutText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// CartItemRow Component
// ============================================================================
interface CartItemRowProps {
  item: any;
  language: string;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}

function CartItemRow({ item, language, onRemove, onUpdateQuantity }: CartItemRowProps) {
  const name = language === 'en' ? item.product?.name_en : item.product?.name_es;

  return (
    <div className="flex gap-3 pb-4 border-b border-gray-100">
      {/* Product Image */}
      {item.product?.thumbnail_url && (
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          <Image
            src={item.product.thumbnail_url}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-purple-600 font-semibold">${item.product?.price.toFixed(2)}</p>

        {item.custom_text && (
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en' ? 'Text' : 'Texto'}: {item.custom_text}
          </p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="ml-auto text-xs text-red-600 hover:text-red-700 font-medium"
          >
            {language === 'en' ? 'Remove' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// components/checkout/ShippingForm.tsx
// ============================================================================
/**
 * Shipping Address Form Component
 * Collects shipping and billing address information
 */

'use client';

// Duplicate import removed
// Duplicate import removed
import type { Address } from '@/types';

interface ShippingFormProps {
  onSubmit: (data: { shipping: Address; billing: Address; sameAsBilling: boolean }) => void;
  isLoading?: boolean;
}

export function ShippingForm({ onSubmit, isLoading = false }: ShippingFormProps) {
  const { language } = useLanguage();
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [formData, setFormData] = useState({
    shipping: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    billing: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section: 'shipping' | 'billing') => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e, 'shipping');
    if (sameAsBilling) {
      handleChange(e, 'billing');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      shipping: formData.shipping as Address,
      billing: sameAsBilling ? (formData.shipping as Address) : (formData.billing as Address),
      sameAsBilling,
    });
  };

  const labels = {
    en: {
      shipping: 'Shipping Address',
      billing: 'Billing Address',
      line1: 'Street Address',
      line2: 'Apartment, suite, etc.',
      city: 'City',
      state: 'State / Province',
      postal: 'Postal Code',
      country: 'Country',
      same: 'Billing address same as shipping',
      submit: 'Continue',
    },
    es: {
      shipping: 'Dirección de Envío',
      billing: 'Dirección de Facturación',
      line1: 'Dirección',
      line2: 'Departamento, suite, etc.',
      city: 'Ciudad',
      state: 'Estado / Provincia',
      postal: 'Código Postal',
      country: 'País',
      same: 'Dirección de facturación igual a la de envío',
      submit: 'Continuar',
    },
  };

  const currentLabels = labels[language as 'en' | 'es'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{currentLabels.shipping}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="line1"
            placeholder={currentLabels.line1}
            value={formData.shipping.line1}
            onChange={handleShippingChange}
            className="col-span-1 sm:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="text"
            name="line2"
            placeholder={currentLabels.line2}
            value={formData.shipping.line2}
            onChange={handleShippingChange}
            className="col-span-1 sm:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            name="city"
            placeholder={currentLabels.city}
            value={formData.shipping.city}
            onChange={handleShippingChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="text"
            name="state"
            placeholder={currentLabels.state}
            value={formData.shipping.state}
            onChange={handleShippingChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="text"
            name="postal_code"
            placeholder={currentLabels.postal}
            value={formData.shipping.postal_code}
            onChange={handleShippingChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <select
            name="country"
            value={formData.shipping.country}
            onChange={handleShippingChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="MX">Mexico</option>
            <option value="BR">Brazil</option>
          </select>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">{currentLabels.same}</span>
        </label>

        {!sameAsBilling && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentLabels.billing}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="line1"
                placeholder={currentLabels.line1}
                value={formData.billing.line1}
                onChange={(e) => handleChange(e, 'billing')}
                className="col-span-1 sm:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <input
                type="text"
                name="city"
                placeholder={currentLabels.city}
                value={formData.billing.city}
                onChange={(e) => handleChange(e, 'billing')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <input
                type="text"
                name="postal_code"
                placeholder={currentLabels.postal}
                value={formData.billing.postal_code}
                onChange={(e) => handleChange(e, 'billing')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          currentLabels.submit
        )}
      </button>
    </form>
  );
}
