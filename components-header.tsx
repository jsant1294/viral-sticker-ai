// components/layout/Header.tsx
/**
 * Main Header Component with Navigation and Language Toggle
 * Features: Bilingual support, cart indicator, language switcher
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { language, t } = useLanguage();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              ViralStickerAI
            </span>
          </Link>

          {/* Navigation Tabs - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/stickers" label={t('nav.stickers')} />
            <NavLink href="/dtf-apparel" label={t('nav.dtf')} />
            <NavLink href="/sublimation" label={t('nav.sublimation')} />
            <NavLink href="/ai-designer" label="AI Designer" />
            <NavLink href="/help" label={t('nav.help')} />
          </nav>

          {/* Right Section: Language Toggle, Cart, Account */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative inline-flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.email}
                </span>
                <button className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 space-y-2">
            <MobileNavLink href="/stickers" label={t('nav.stickers')} />
            <MobileNavLink href="/dtf-apparel" label={t('nav.dtf')} />
            <MobileNavLink href="/sublimation" label={t('nav.sublimation')} />
            <MobileNavLink href="/ai-designer" label="AI Designer" />
            <MobileNavLink href="/help" label={t('nav.help')} />
          </nav>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// NavLink Component - Desktop Navigation
// ============================================================================
interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors"
    >
      {label}
    </Link>
  );
}

// ============================================================================
// MobileNavLink Component
// ============================================================================
function MobileNavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors"
    >
      {label}
    </Link>
  );
}

// ============================================================================
// Footer Component
// ============================================================================

export function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">ViralStickerAI</h3>
            <p className="text-sm">
              {language === 'en'
                ? 'AI-assisted stickers, DTF apparel, and sublimation products.'
                : 'Pegatinas asistidas por IA, ropa DTF y productos de sublimación.'}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {language === 'en' ? 'Shop' : 'Tienda'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stickers" className="hover:text-white transition-colors">
                  {t('nav.stickers')}
                </Link>
              </li>
              <li>
                <Link href="/dtf-apparel" className="hover:text-white transition-colors">
                  {t('nav.dtf')}
                </Link>
              </li>
              <li>
                <Link href="/sublimation" className="hover:text-white transition-colors">
                  {t('nav.sublimation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {language === 'en' ? 'Support' : 'Soporte'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  {t('nav.help')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {language === 'en' ? 'FAQ' : 'Preguntas Frecuentes'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Contact' : 'Contacto'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {language === 'en' ? 'Legal' : 'Legal'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Terms of Service' : 'Términos de Servicio'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; 2024 ViralStickerAI.com. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
