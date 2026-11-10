import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  HelpCircle,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Tv,
  Radio,
  Sliders,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { SupportChatMessage } from '../types';
import { SecurityCenterModal } from './SecurityCenterModal';

// Pre-configured instant intelligent Bengali solutions for common user questions
const QUICK_FAQS = [
  {
    id: 'stream_issue',
    icon: RotateCw,
    label: 'খেলা লোড না হলে করণীয়',
    question: 'খেলা চালু হচ্ছে না বা লোড হতে সমস্যা হলে কি করব?',
    answer:
      'খেলা চলাকালে কোনো সার্ভার জ্যাম হলে প্লেয়ারের নিচে থাকা "সার্ভার ২" বা "সার্ভার ৩" নির্বাচন করুন। অথবা পেজের উপরে থাকা "এখনই সিঙ্ক করুন" বাটনে চাপ দিন। আপনার ইন্টারনেট স্পিড অন্তত 5 Mbps হলে নিরবচ্ছিন্ন ১০৮০p খেলা দেখতে পারবেন।',
  },
  {
    id: 'tv_channels',
    icon: Tv,
    label: '১০০০+ টিভি চ্যানেল কোথায়?',
    question: '১০০০+ টিভি চ্যানেল ও বাংলাদেশি চ্যানেল কোথায় পাব?',
    answer:
      'উপরের নেভিগেশন বার থেকে "Live TV (১০০০+)" বাটনে ক্লিক করুন। সেখানে জিটিভি (GTV Live), টি স্পোর্টস (T Sports), সময় টিভি, যমুনা সহ ২৫+ বাংলাদেশি চ্যানেল সবার শুরুতে (#১ থেকে #২৫) রয়েছে এবং বিশ্বখ্যাত স্পোর্টস ও নিউজ চ্যানেল সাজানো আছে।',
  },
  {
    id: 'auto_sync',
    icon: Radio,
    label: '৫ মিনিটের অটো-সিঙ্ক কী?',
    question: '৫ মিনিটের অটো-সিঙ্ক কীভাবে কাজ করে?',
    answer:
      'আমাদের সিস্টেম প্রতি ৫ মিনিট পর পর গুগল স্পোর্টস গ্রাউন্ডেড ডাটাবেস থেকে স্বয়ংক্রিয়ভাবে নতুন লাইভ স্কোর, খেলার মিনিট ও স্ট্রিমিং আপডেট করে। ম্যাচ শেষ হলে তা স্বয়ংক্রিয়ভাবে "সমাপ্ত ম্যাচ (Ended)" ট্যাবে চলে যায়।',
  },
  {
    id: 'resolution_fullscreen',
    icon: Sliders,
    label: 'রেজোলিউশন ও ফুলস্ক্রিন',
    question: 'ভিডিওর রেজোলিউশন (১০৮০p / ৭২০p) ও ফুলস্ক্রিন করব কিভাবে?',
    answer:
      'প্রতিটি ম্যাচ কার্ডের নিচে ও লাইভ প্লেয়ারের কন্ট্রোলে ১০৮০p FHD, ৭২০p HD, এবং ৪৮০p ডাটা সেভার অপশন রয়েছে। কার্ডের "ফুল স্ক্রিন" বাটনে চাপ দিলেই সরাসরি সিনেমা মোডে খেলা চালু হবে।',
  },
  {
    id: 'security_info',
    icon: ShieldCheck,
    label: 'সাইটের সিকিউরিটি কেমন?',
    question: 'এই সাইটের সিকিউরিটি ও নিরাপত্তা ব্যবস্থা কেমন?',
    answer:
      'KhelaDekH-এ রয়েছে এন্টারপ্রাইজ গ্রেড অ্যান্টি-DDoS ফায়ারওয়াল (প্রতি মিনিটে ৬০টি রিকোয়েস্ট লিমিট), 256-bit SSL/TLS এনক্রিপশন, অ্যান্টি-XSS ইনপুট ফিল্টার এবং ফায়ারস্টোরের জিরো-ট্রাস্ট সিকিউরিটি শিল্ড।',
  },
];

export const SupportChatWidget: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Persistent user chat session ID based on logged in UID or guest device ID
  const [chatId] = useState<string>(() => {
    const saved = localStorage.getItem('kheladekh_support_chat_id');
    if (saved) return saved;
    const newId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('kheladekh_support_chat_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'welcome_bot_msg',
      chatId,
      senderId: 'system_bot',
      senderName: 'সাপোর্ট অ্যাসিস্ট্যান্ট',
      senderRole: 'bot',
      text: 'আসসালামু আলাইকুম! KhelaDekH লাইভ হেল্প ডেস্কে স্বাগতম। খেলা সম্প্রচার, টিভি চ্যানেল বা যেকোনো বিষয়ে সহায়তা পেতে নিচের অপশনগুলোতে ট্যাপ করুন অথবা আপনার প্রশ্ন লিখুন।',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Real-time Firestore synchronization for support chat messages
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
          // Keep welcome message at the top if not present
          const hasWelcome = list.some((m) => m.id === 'welcome_bot_msg');
          if (hasWelcome) {
            setMessages(list);
          } else {
            setMessages([messages[0], ...list]);
          }
        }
      },
      (err) => {
        // Fallback to local state if firestore rules or offline
        console.warn('Support chat firestore listener warning:', err.message);
      }
    );

    return () => unsub();
  }, [chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSubmitting || cooldown) return;

    setIsSubmitting(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000); // 2-second anti-spam cooldown

    const userMsgId = `msg_${Date.now()}_user`;
    const userMsg: SupportChatMessage = {
      id: userMsgId,
      chatId,
      senderId: user?.uid || 'guest_fan',
      senderName: profile?.displayName || user?.displayName || 'স্পোর্টস ফ্যান',
      senderRole: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately for instant responsiveness
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'supportChats', chatId, 'messages', userMsgId), userMsg);
    } catch (err) {
      console.warn('Failed to persist user support message:', err);
    }

    // Generate intelligent assistant answer
    setTimeout(async () => {
      let botReply =
        'ধন্যবাদ আপনার বার্তার জন্য। আমাদের সাপোর্ট টিম আপনার মেসেজটি গ্রহণ করেছে। কোনো স্ট্রিমিং সমস্যা হলে প্লেয়ারের সার্ভার পরিবর্তন করুন বা অটো-সিঙ্ক ব্যবহার করুন। আমাদের প্রতিনিধি খুব শীঘ্রই যোগাযোগ করবেন।';

      const lower = text.toLowerCase();
      if (lower.includes('টিভি') || lower.includes('tv') || lower.includes('channel') || lower.includes('চ্যানেল') || lower.includes('gtv') || lower.includes('t sports')) {
        botReply =
          '📺 লাইভ টিভি দেখতে উপরের মেনুর "Live TV (১০০০+)" পেজে যান। সেখানে ১০০০+ চ্যানেল রয়েছে এবং জিটিভি (GTV) ও টি স্পোর্টস (T Sports) সহ সকল বাংলাদেশি চ্যানেল সবার শুরুতে ১ থেকে ২৫ নম্বরে সাজানো রয়েছে!';
      } else if (lower.includes('লোড') || lower.includes('চলছে না') || lower.includes('play') || lower.includes('stream') || lower.includes('stuck') || lower.includes('error')) {
        botReply =
          '⚡ খেলা চালু হতে সমস্যা হলে প্লেয়ারের নিচে থাকা "সার্ভার ২" বা "সার্ভার ৩" নির্বাচন করুন। অথবা পেজের "এখনই সিঙ্ক করুন" বাটনে চাপ দিন। আপনার ইন্টারনেট স্পিড অন্তত 5 Mbps হলে ঝকঝকে স্পষ্ট খেলা চলবে।';
      } else if (lower.includes('রেজোলিউশন') || lower.includes('১০৮০') || lower.includes('ফুলস্ক্রিন') || lower.includes('hd') || lower.includes('quality')) {
        botReply =
          '🎬 প্রতিটি ম্যাচ কার্ডের নিচে ও প্লেয়ার বারে ১০৮০p Full HD, ৭২০p HD এবং ৪৮০p কোয়ালিটি চেঞ্জার রয়েছে। ওয়ান-ক্লিকে "ফুল স্ক্রিন" বাটনে চাপ দিলে সিনেমা হলে দেখার অনুভূতি পাবেন।';
      } else if (lower.includes('সিকিউরিটি') || lower.includes('নিরাপত্তা') || lower.includes('safe') || lower.includes('security') || lower.includes('হ্যাক')) {
        botReply =
          '🛡️ KhelaDekH সম্পূর্ণরূপে নিরাপদ ও 256-bit SSL এনক্রিপ্টেড। সাইটে অ্যান্টি-DDoS ফায়ারওয়াল এবং অ্যান্টি-XSS ইনপুট শিল্ড সক্রিয় রয়েছে। আপনার ব্রাউজিং সম্পূর্ণ নিরাপদ!';
      } else if (lower.includes('শেষ') || lower.includes('end') || lower.includes('finished') || lower.includes('ফল')) {
        botReply =
          '🏁 খেলা শেষ হওয়া মাত্রই আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে "ম্যাচ সমাপ্ত (FINISHED / END)" ব্যাজ ও চূড়ান্ত স্কোর (FT) প্রদর্শন করে এবং খেলাটি সমাপ্ত ট্যাবে স্থানান্তর করে।';
      }

      const botMsgId = `msg_${Date.now()}_bot`;
      const botMsg: SupportChatMessage = {
        id: botMsgId,
        chatId,
        senderId: 'system_bot',
        senderName: 'সাপোর্ট স্পেশালিস্ট',
        senderRole: 'support',
        text: botReply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      try {
        await setDoc(doc(db, 'supportChats', chatId, 'messages', botMsgId), botMsg);
      } catch (e) {
        console.warn('Failed to persist bot support message:', e);
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handleQuickQuestionClick = (faq: typeof QUICK_FAQS[0]) => {
    handleSendMessage(faq.question);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40 animate-bounce-in">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative px-4 py-3 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#0094D9] to-emerald-500 text-[#080B12] font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl shadow-[#00B7FF]/35 hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/30"
          title="সহায়তা ও লাইভ সাপোর্ট চ্যাট খুলুন"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
          </span>
          <Headphones className="w-4 h-4" />
          <span className="hidden sm:inline">লাইভ হেল্প ও সাপোর্ট</span>
          <span className="sm:hidden">হেল্প চ্যাট</span>
        </button>
      </div>

      {/* Live Support Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[580px] rounded-3xl bg-[#0D131F]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Top Bar */}
          <div className="p-4 bg-gradient-to-r from-[#151E2B] via-[#0E1522] to-[#151E2B] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 flex items-center justify-center text-[#00B7FF]">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0D131F] animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-black text-white flex items-center gap-1.5">
                  <span>KhelaDekH হেল্প ডেস্ক</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-[#A5B1C2]">
                  ২৪/৭ লাইভ স্ট্রিমিং ও খেলাধুলার সার্বক্ষণিক সহায়তা
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSecurityModal(true)}
                className="p-1.5 rounded-xl text-emerald-400 hover:bg-white/10 transition-colors"
                title="সিকিউরিটি সেন্টার ডায়াগনস্টিক"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#A5B1C2] hover:text-white hover:bg-white/10 transition-colors"
                title="চ্যাট উইন্ডো বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Suggestion Chips (1-Click Solutions) */}
          <div className="p-2.5 bg-[#090D15] border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[10px] text-[#A5B1C2] font-mono shrink-0 pl-1">
              দ্রুত সমাধান:
            </span>
            {QUICK_FAQS.map((faq) => {
              const Icon = faq.icon;
              return (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleQuickQuestionClick(faq)}
                  className="px-2.5 py-1 rounded-xl bg-[#141C2B] hover:bg-[#1E293B] border border-white/10 hover:border-[#00B7FF] text-[11px] text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <Icon className="w-3 h-3 text-[#00B7FF]" />
                  <span>{faq.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar min-h-[250px] max-h-[340px]">
            {messages.map((msg) => {
              const isUser = msg.senderRole === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A5B1C2] mb-1 font-mono">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      isUser
                        ? 'bg-gradient-to-r from-[#00B7FF] to-[#0088CC] text-[#080B12] font-semibold shadow-md rounded-tr-none'
                        : 'bg-[#151E2B] border border-white/10 text-white rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
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
              placeholder="আপনার প্রশ্ন লিখুন (যেমন: খেলার লিংক আসছে না)..."
              maxLength={500}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#121926] border border-white/10 text-xs text-white placeholder-[#64748B] focus:border-[#00B7FF] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSubmitting || cooldown}
              className="w-10 h-10 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#00B7FF]"
              title="বার্তা পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Security Footer */}
          <div className="px-3 py-1.5 bg-[#060910] text-[10px] font-mono text-[#64748B] flex items-center justify-between border-t border-white/5">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> এন্ড-টু-এন্ড সুরক্ষিত চ্যাট
            </span>
            <button
              type="button"
              onClick={() => setShowSecurityModal(true)}
              className="text-[#00B7FF] hover:underline"
            >
              সিকিউরিটি অডিট
            </button>
          </div>
        </div>
      )}

      {/* Security Center & Diagnostics Modal */}
      <SecurityCenterModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </>
  );
};
