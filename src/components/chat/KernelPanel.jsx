import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api.js';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-green-300 overflow-x-auto my-1 font-mono">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      i++;
      continue;
    }

    // Bullet list
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li key={j}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li key={j}>{inlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="leading-relaxed">{inlineMarkdown(line)}</p>);
    i++;
  }

  return elements;
}

function inlineMarkdown(text) {
  // Split on bold (**text**), inline code (`code`)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-black/50 border border-white/10 rounded px-1 text-green-300 text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-heading font-bold mr-2 mt-1 shrink-0"
          style={{ boxShadow: '0 0 8px rgba(34,197,94,0.3)' }}
        >
          K
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm font-body
          ${isUser
            ? 'bg-accent text-black font-medium rounded-br-sm leading-relaxed'
            : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-sm backdrop-blur-sm'
          }`}
      >
        {isUser ? msg.content : renderMarkdown(msg.content)}
      </div>
    </motion.div>
  );
}

export default function KernelPanel({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load history on first open
  useEffect(() => {
    if (open && !historyLoaded) {
      api.get('/api/chat/history')
        .then(r => {
          setMessages(r.data);
          setHistoryLoaded(true);
        })
        .catch(() => setHistoryLoaded(true));
    }
  }, [open, historyLoaded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', { message: text });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  async function handleClear() {
    await api.delete('/api/chat/history');
    setMessages([]);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — subtle, only dims slightly */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 flex flex-col rounded-2xl overflow-hidden"
            style={{
              height: 'min(520px, calc(100vh - 120px))',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              boxShadow: '0 0 40px rgba(34, 197, 94, 0.08), 0 20px 60px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: 'rgba(34, 197, 94, 0.15)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent text-xs font-heading font-bold"
                  style={{ boxShadow: '0 0 12px rgba(34,197,94,0.35)' }}
                >
                  K
                </div>
                <div>
                  <p className="text-white text-sm font-heading font-semibold leading-none">Kernel</p>
                  <p className="text-accent text-xs font-body mt-0.5 leading-none" style={{ textShadow: '0 0 8px rgba(34,197,94,0.5)' }}>
                    AI Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer text-xs font-body"
                    title="Clear history"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-zinc-600 hover:text-white transition-colors duration-200 cursor-pointer"
                  aria-label="Close Kernel"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-none">
              {messages.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6 gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-lg font-heading font-bold"
                    style={{ boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
                  >
                    K
                  </div>
                  <p className="text-zinc-300 font-heading font-medium text-sm">Hey, I'm Kernel</p>
                  <p className="text-zinc-600 font-body text-xs leading-relaxed">
                    Ask me about your tasks, resources, feedback — or anything else.
                  </p>
                </motion.div>
              )}

              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm backdrop-blur-sm ml-8"
                  >
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 py-3 border-t shrink-0"
              style={{ borderColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Kernel anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 font-body outline-none focus:border-accent/40 transition-colors duration-200"
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity duration-200 cursor-pointer"
                style={{ boxShadow: input.trim() ? '0 0 12px rgba(34,197,94,0.4)' : 'none' }}
              >
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
