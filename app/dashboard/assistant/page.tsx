'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: Date;
}

export default function AssistantPage() {
  
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      message: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          message: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const error = await response.json();
        const errorMessage: ChatMessage = {
          role: 'assistant',
          message: error.error || 'An error occurred. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[v0] Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        message:
          'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function t(arg0: string): import("react").ReactNode {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Tracker
          </h1>
          <p className="text-gray-600 mt-2">Expense Tracker</p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 p-6 mb-6 overflow-y-auto bg-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-gray-600">Expense Tracker</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-bl-none'
                        : 'bg-gray-200 text-gray-900 rounded-br-none'
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    {msg.timestamp && (
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-600'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-br-none">
                    <p className="text-sm">Expense Tracker</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Card>

        {/* Input Area */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Ask expense tracker..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? '...' : t('ai.sendMessage')}
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Expense Tracker powered by Groq AI. Ask me about your budget, spending patterns, or savings strategies!
          </p>
        </div>
      </div>
    </div>
  );
}
