'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types';

export function useAdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userId: string, content: string) => {
    const text = content.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setError(null);

    try {
      const history = [...messages, userMessage];
      const response = await fetch('/api/career/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messages: history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get a response');

      const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get a response';
      setError(message.includes('All AI providers failed')
        ? 'Could not reach the AI. Please configure an AI provider in your app settings.'
        : message);
    } finally {
      setSending(false);
    }
  }, [messages, sending]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sending, error, sendMessage, reset };
}
