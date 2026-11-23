import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Tv,
  Trophy,
  Radio,
  Users,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SupportChatMessage } from '../types';

const QUICK_PROMPTS = [
  {
    id: 'live_today',
    icon: Radio,
    label: 'আজকের লাইভ খেলা',
    question: 'আজকে কোন কোন লাইভ খেলা চলছে এবং লাইভ স্কোর কত?',
  },
  {
    id: 'captains_info',
    icon: Users,
    label: 'দলের অধিনায়কদের তথ্য',
    question: 'বাংলাদেশ ক্রিকেট দল ও ইউরোপের বড় ফুটবল ক্লাবগুলোর বর্তমান অধিনায়ক কারা?',
  },
  {
    id: 'tv_guide',
    icon: Tv,
    label: 'লাইভ টিভি চ্যানেল',
    question: 'লাইভ টিভি ও বাংলাদেশি চ্যানেলগুলো কোথায় দেখব?',
  },
  {
    id: 'sports_rules',
    icon: Trophy,
    label: 'যেকোনো প্রশ্ন করুন',
    question: 'টি-টোয়েন্টি ক্রিকেটে পাওয়ারপ্লে এবং ডিআরএস (DRS) এর নিয়ম কী?',
  },
];

export const SupportChatWidget: React.FC = () => {
  const { user, profile } = useAuth();
  const { events } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [chatId] = useState<string>(() => {
    const saved = localStorage.getItem('kheladekh_ai_chat_id');
    if (saved) return saved;
    const newId = `kdai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('kheladekh_ai_chat_id', newId);
    return newId;
  });

  const welcomeMessage: SupportChatMessage = {
    id: 'welcome_kheladekh_ai',
    chatId,
    senderId: 'kheladekh_ai',
    senderName: 'KhelaDekH AI',
    senderRole: 'assistant' as any,
    text: 'স্বাগতম! আমি KhelaDekH AI। খেলার লাইভ স্কোর, দলের অধিনায়ক, টিভি চ্যানেল কিংবা পৃথিবীর যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন।',
    createdAt: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<SupportChatMessage[]>([welcomeMessage]);

  useEffect(() => {
    const q = query(
      collection(db, 'supportChats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as SupportChatMessage);
          const hasWelcome = list.some((m) => m.id === 'welcome_kheladekh_ai');
          setMessages(hasWelcome ? list : [welcomeMessage, ...list]);
        }
      },
      () => {}
    );

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSubmitting]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);

    const userMsgId = `msg_${Date.now()}_u`;
    const userMsg: SupportChatMessage = {
      id: userMsgId,
      chatId,
      senderId: user?.uid || 'guest_fan',
      senderName: profile?.displayName || user?.displayName || 'আপনি',
      senderRole: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputMessage('');

    setDoc(doc(db, 'supportChats', chatId, 'messages', userMsgId), userMsg).catch(() => {});

    try {
      const liveMatchesContext = events
        .slice(0, 8)
        .map((e) => `${e.title} (${e.status}) - ${e.scoreSummary || e.eventTime}`)
        .join(' | ');

      const res = await fetch('/api/kheladekh-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          history: nextHistory.slice(-6),
          liveMatchesContext,
        }),
      });

      const data = await res.json();
      const replyText =
        data?.reply ||
        'আমি KhelaDekH AI বলছি — আপনার প্রশ্নটি প্রসেস করতে এই মুহূর্তে সাময়িক বিলম্ব হচ্ছে, দয়া করে আবার চেষ্টা করুন।';

      const aiMsgId = `msg_${Date.now()}_kdai`;
      const aiMsg: SupportChatMessage = {
        id: aiMsgId,
        chatId,
        senderId: 'kheladekh_ai',
        senderName: 'KhelaDekH AI',
        senderRole: 'support',
        text: replyText,
        sources: Array.isArray(data?.sources) ? data.sources : [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setDoc(doc(db, 'supportChats', chatId, 'messages', aiMsgId), aiMsg).catch(() => {});
    } catch {
      const errMsg: SupportChatMessage = {
        id: `msg_${Date.now()}_err`,
        chatId,
        senderId: 'kheladekh_ai',
        senderName: 'KhelaDekH AI',
        senderRole: 'support',
        text: 'দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার প্রশ্ন করুন।',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom-Right) */}
      <div className="fixed bottom-20 md:bottom-6 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative px-4 py-3 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#0094D9] to-[#16D98A] text-[#080B12] font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-[#00B7FF]/35 hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/30"
          title="KhelaDekH AI কে যেকোনো প্রশ্ন করুন"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>KhelaDekH AI</span>
        </button>
      </div>

      {/* KhelaDekH AI Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[430px] max-h-[580px] rounded-3xl bg-[#0D131F]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#151E2B] via-[#0E1522] to-[#151E2B] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#00B7FF]/15 border border-[#00B7FF]/35 flex items-center justify-center text-[#00B7FF]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#16D98A] border-2 border-[#0D131F]" />
              </div>
              <div>
                <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                  <span>KhelaDekH AI</span>
                  <span className="text-[10px] font-mono font-bold text-[#16D98A]">ONLINE</span>
                </h3>
                <p className="text-[11px] text-[#A5B1C2]">
                  খেলাধুলা ও যেকোনো প্রশ্নের তাৎক্ষণিক উত্তর
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-[#A5B1C2] hover:text-white hover:bg-white/10 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Question Chips */}
          <div className="p-2.5 bg-[#090D15] border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2">
            {QUICK_PROMPTS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSendMessage(item.question)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C2B] hover:bg-[#1E293B] border border-white/10 hover:border-[#00B7FF] text-[11px] text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <Icon className="w-3 h-3 text-[#00B7FF]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar min-h-[260px] max-h-[360px]">
            {messages.map((msg) => {
              const isUser = msg.senderRole === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A5B1C2] mb-1 font-mono">
                    <span>{isUser ? msg.senderName : 'KhelaDekH AI'}</span>
                    <span>·</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-[#00B7FF] to-[#0088CC] text-[#080B12] font-semibold shadow-md rounded-tr-none'
                        : 'bg-[#151E2B] border border-white/10 text-white rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#00B7FF] hover:underline truncate"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSubmitting && (
              <div className="flex items-start gap-2 text-xs text-[#00B7FF]">
                <div className="px-3 py-2 rounded-2xl rounded-tl-none bg-[#151E2B] border border-white/10 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>KhelaDekH AI চিন্তা করছে...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0A0E18] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="যেকোনো প্রশ্ন লিখুন..."
              maxLength={600}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#121926] border border-white/10 text-xs text-white placeholder-[#64748B] focus:border-[#00B7FF] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSubmitting}
              className="w-10 h-10 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] flex items-center justify-center transition-all disabled:opacity-40"
              title="প্রশ্ন পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
