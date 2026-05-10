import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function TaskDiscussion({ taskId, studentId, onClose }) {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const url = `/api/tasks/${taskId}/messages${studentId ? `?studentId=${studentId}` : ''}`;
      const { data } = await api.get(url);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Simple polling every 5 seconds for now (Real-time would be better but this is simpler for MVP)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [taskId, studentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(`/api/tasks/${taskId}/messages`, {
        content,
        studentId: studentId // Only used by admin
      });
      setMessages(prev => [...prev, data]);
      setContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-surface-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-heading font-bold shadow-lg shadow-accent/5">
             D
          </div>
          <div>
            <h3 className="text-white text-sm font-heading font-semibold leading-tight">Discussion</h3>
            <p className="text-[10px] text-zinc-500 font-body uppercase tracking-wider mt-0.5">
              Task specific chat
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
             <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-heading uppercase tracking-widest text-zinc-500">Loading discussion...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-40">
             <svg className="w-8 h-8 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             <p className="text-xs text-zinc-600 font-body">No messages yet. Ask a question or share progress.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-body leading-relaxed shadow-sm
                  ${isMe 
                    ? 'bg-accent text-black font-medium rounded-br-none' 
                    : 'bg-surface-2 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {m.content}
                  <div className={`text-[9px] mt-1.5 flex items-center gap-1.5 opacity-40 ${isMe ? 'text-black' : 'text-zinc-500'}`}>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && m.is_read && <span>· Read</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-surface-2/50 border-t border-white/5">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-accent/40 transition-colors">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-xs text-white font-body py-1 max-h-32 scrollbar-none"
            rows={1}
            style={{ height: 'auto', resize: 'none' }}
            ref={el => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
          />
          <button 
            type="submit" 
            disabled={!content.trim() || sending}
            className="w-8 h-8 rounded-lg bg-accent text-black flex items-center justify-center hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-0.5 shadow-lg shadow-accent/20"
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[9px] text-zinc-700 mt-2 text-center uppercase tracking-widest font-heading">
          Shift + Enter for new line
        </p>
      </form>
    </div>
  );
}
