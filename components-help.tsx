// components/help/HelpWidget.tsx
/**
 * Floating Help Widget with Multi-Agent Chat Support
 * Features: Agent selection, bilingual support, persistent conversations
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './contexts';
import type { HelpMessage } from '@/types';

interface AgentType {
  id: string;
  name_en: string;
  name_es: string;
  icon: string;
  description_en: string;
  description_es: string;
}

const AGENTS: AgentType[] = [
  {
    id: 'product_specialist',
    name_en: 'Product Specialist',
    name_es: 'Especialista en Productos',
    icon: '🎨',
    description_en: 'Questions about stickers, DTF apparel, and sublimation items',
    description_es: 'Preguntas sobre pegatinas, ropa DTF y artículos de sublimación',
  },
  {
    id: 'shipping_specialist',
    name_en: 'Shipping & Orders',
    name_es: 'Envío y Pedidos',
    icon: '📦',
    description_en: 'Shipping rates, delivery times, and order tracking',
    description_es: 'Tasas de envío, tiempos de entrega y seguimiento de pedidos',
  },
  {
    id: 'technical_support',
    name_en: 'Technical Support',
    name_es: 'Soporte Técnico',
    icon: '🛠️',
    description_en: 'Customization, file uploads, and design questions',
    description_es: 'Personalización, carga de archivos y preguntas de diseño',
  },
  {
    id: 'general',
    name_en: 'General Support',
    name_es: 'Soporte General',
    icon: '💬',
    description_en: 'Returns, refunds, and general inquiries',
    description_es: 'Devoluciones, reembolsos e consultas generales',
  },
];

export function HelpWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<'closed' | 'agents' | 'chat'>('closed');
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setStage('agents');
  };

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setStage('chat');
    setMessages([
      {
        id: '1',
        sender_type: 'agent',
        agent_type: agent.id as any,
        message_en:
          language === 'en'
            ? `Hi! I'm a ${agent.name_en}. How can I help you today?`
            : `¡Hola! Soy un ${agent.name_es}. ¿Cómo puedo ayudarte hoy?`,
        message_es:
          language === 'es'
            ? `¡Hola! Soy un ${agent.name_es}. ¿Cómo puedo ayudarte hoy?`
            : `Hi! I'm a ${agent.name_en}. How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Add user message
    const newMessage: HelpMessage = {
      id: Date.now().toString(),
      sender_type: 'user',
      message_en: userMessage,
      message_es: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setUserMessage('');
    setLoading(true);

    try {
      // Mock API call to get agent response
      // In production, this would call an actual API
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      const agentResponse: HelpMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'agent',
        agent_type: selectedAgent?.id as any,
        message_en: getMockResponse(language === 'en' ? 'en' : 'es', selectedAgent?.id || 'general'),
        message_es: getMockResponse('es', selectedAgent?.id || 'general'),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStage('closed');
  };

  const displayMessage =
    language === 'en'
      ? messages.map((m) => m.message_en || m.message_es || '')
      : messages.map((m) => m.message_es || m.message_en || '');

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
          aria-label="Open help widget"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">
                {language === 'en' ? 'How can we help?' : '¿Cómo podemos ayudarte?'}
              </h3>
              {selectedAgent && (
                <p className="text-sm text-pink-100">
                  {language === 'en' ? selectedAgent.name_en : selectedAgent.name_es}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {stage === 'agents' && <AgentSelector agents={AGENTS} onSelect={handleSelectAgent} language={language} />}

            {stage === 'chat' && (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={language === 'en' ? msg.message_en : msg.message_es}
                    senderType={msg.sender_type}
                    isUser={msg.sender_type === 'user'}
                  />
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {stage === 'chat' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'en' ? 'Type your message...' : 'Escribe tu mensaje...'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !userMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ============================================================================
// AgentSelector Component
// ============================================================================
interface AgentSelectorProps {
  agents: AgentType[];
  onSelect: (agent: AgentType) => void;
  language: string;
}

function AgentSelector({ agents, onSelect, language }: AgentSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        {language === 'en' ? 'Select a specialist to get started:' : 'Selecciona un especialista para comenzar:'}
      </p>
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelect(agent)}
          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{agent.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900">
                {language === 'en' ? agent.name_en : agent.name_es}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {language === 'en' ? agent.description_en : agent.description_es}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// ChatMessage Component
// ============================================================================
interface ChatMessageProps {
  message: string | undefined;
  senderType: string;
  isUser: boolean;
}

function ChatMessage({ message, senderType, isUser }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message}
      </div>
    </div>
  );
}

// ============================================================================
// TypingIndicator Component
// ============================================================================
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mock Response Generator
// ============================================================================
function getMockResponse(language: 'en' | 'es', agentId: string): string {
  const responses = {
    en: {
      product_specialist: [
        'All our stickers are printed on premium vinyl and are waterproof. Our DTF apparel uses high-quality direct-to-fabric printing for vibrant, long-lasting colors.',
        'Yes! You can customize any product with text or your logo. The customization options vary by product.',
        'Our sublimation items are perfect for personalized gifts and are durable enough for everyday use.',
      ],
      shipping_specialist: [
        'We offer standard shipping (5-7 business days) for $5.99 and express shipping (2-3 days) for $14.99 within the US.',
        'You can track your order using the tracking code sent to your email after shipment.',
        'International shipping is available to most countries. Rates vary by destination.',
      ],
      technical_support: [
        'You can upload your custom logo as PNG, JPG, or PDF. We support high-resolution files up to 50MB.',
        'For the best results, use vector files (AI, EPS, SVG) for custom designs. Raster images should be at least 300 DPI.',
        'Our AI Designer tool can help you create design ideas. You can then customize and add to your cart.',
      ],
      general: [
        'We offer 30-day returns on most items in original condition. Please contact us for return shipping instructions.',
        'Refunds are typically processed within 5-7 business days after we receive your return.',
        'Thank you for contacting ViralStickerAI! Is there anything else I can help you with?',
      ],
    },
    es: {
      product_specialist: [
        'Todas nuestras pegatinas están impresas en vinilo premium e impermeables. Nuestra ropa DTF utiliza impresión de alta calidad directamente en tela para colores vibrantes y duraderos.',
        '¡Sí! Puedes personalizar cualquier producto con texto o tu logo. Las opciones de personalización varían según el producto.',
        'Nuestros artículos de sublimación son perfectos para regalos personalizados y son lo suficientemente duraderos para uso diario.',
      ],
      shipping_specialist: [
        'Ofrecemos envío estándar (5-7 días hábiles) por $5.99 y envío express (2-3 días) por $14.99 dentro de EE.UU.',
        'Puedes rastrear tu pedido usando el código de seguimiento enviado a tu correo después del envío.',
        'El envío internacional está disponible para la mayoría de países. Las tarifas varían según el destino.',
      ],
      technical_support: [
        'Puedes cargar tu logo personalizado en PNG, JPG o PDF. Soportamos archivos de alta resolución hasta 50MB.',
        'Para mejores resultados, utiliza archivos vectoriales (AI, EPS, SVG) para diseños personalizados. Las imágenes rasterizadas deben tener al menos 300 DPI.',
        'Nuestra herramienta AI Designer puede ayudarte a crear ideas de diseño. Luego puedes personalizar y añadir al carrito.',
      ],
      general: [
        'Ofrecemos devoluciones de 30 días en la mayoría de artículos en condición original. Por favor contactanos para instrucciones de envío de devolución.',
        'Los reembolsos se procesan generalmente dentro de 5-7 días hábiles después de que recibamos tu devolución.',
        '¡Gracias por contactar a ViralStickerAI! ¿Hay algo más en lo que pueda ayudarte?',
      ],
    },
  };

  const agentResponses = responses[language]?.[agentId as keyof typeof responses['en']];
  if (!agentResponses) return language === 'en' ? 'How can I help you?' : '¿Cómo puedo ayudarte?';

  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}
