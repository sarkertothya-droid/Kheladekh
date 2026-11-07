import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import {
  Send,
  Trash2,
  MessageSquare,
  Users,
  Shield,
  Smile,
  LogIn,
  ChevronDown,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { MatchChatMessage, Team } from '../types';
import { Link } from 'react-router-dom';

interface LiveMatchChatProps {
  eventId: string;
  eventTitle: string;
  teams?: Team[];
}

const QUICK_EMOJIS = ['🔥', '⚽', '🏏', '🏆', '👏', '💥', '🇧🇩', '⚡', '🙌', '😱'];

export const LiveMatchChat: React.FC<LiveMatchChatProps> = ({
  eventId,
  eventTitle,
  teams = [],
}) => {
  const { user, profile, isAdmin, signInWithGoogle } = useAuth();
  const [messages, setMessages] = useState<MatchChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Listen to live messages in real-time
  useEffect(() => {
    if (!eventId) return;

    const messagesRef = collection(db, 'events', eventId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limitToLast(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => docSnap.data() as MatchChatMessage);
        setMessages(items);

        // Auto-scroll to bottom if user is not scrolled up
        if (!hasScrolledUp) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }
      },
      (err) => {
        console.warn('Live chat snapshot warning:', err);
        // Fallback gracefully without breaking UI
      }
    );

    return () => unsubscribe();
  }, [eventId, hasScrolledUp]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    const el = chatScrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setHasScrolledUp(!isNearBottom);
  };

  const scrollToBottom = () => {
    setHasScrolledUp(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !user) return;

    if (trimmed.length > 500) {
      setErrorBanner('Message is too long (max 500 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const teamSupportLabel =
      selectedTeam !== 'neutral'
        ? teams.find((t) => t.id === selectedTeam)?.name || selectedTeam
        : undefined;

    const chatDoc: MatchChatMessage = {
      id: msgId,
      eventId,
      userId: user.uid,
      userName: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Sports Fan',
      userAvatar: profile?.photoURL || user.photoURL || undefined,
      text: trimmed,
      teamSupport: teamSupportLabel,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, 'events', eventId, 'messages', msgId);
      await setDoc(docRef, chatDoc);
      setInputText('');
      setHasScrolledUp(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      console.error('Failed to send live chat message:', err);
      setErrorBanner('Could not send message. Please verify connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'events', eventId, 'messages', msgId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${eventId}/messages/${msgId}`);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  // Helper for human-readable timestamps
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-[#151E2B] rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#101722]/60 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 flex items-center justify-center text-[#00B7FF]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold text-white">
                Live Match Discussion
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16D98A]/20 border border-[#16D98A]/40 text-[#16D98A] text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16D98A] animate-pulse" />
                Live Chat
              </span>
            </div>
            <p className="text-xs text-[#A5B1C2] truncate max-w-xs sm:max-w-md">
              Real-time comments from fans watching {eventTitle}
            </p>
          </div>
        </div>

        {/* Team Cheering Flair Selector */}
        {teams.length >= 2 && user && (
          <div className="flex items-center gap-1.5 bg-[#101722] p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] text-[#A5B1C2] px-2 font-mono">Cheering for:</span>
            <button
              type="button"
              onClick={() => setSelectedTeam('neutral')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedTeam === 'neutral'
                  ? 'bg-white/15 text-white'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              Neutral
            </button>
            {teams.slice(0, 2).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTeam(t.id)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTeam === t.id
                    ? 'bg-[#00B7FF] text-[#080B12]'
                    : 'text-[#A5B1C2] hover:text-white'
                }`}
              >
                {t.shortName || t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollContainerRef}
        onScroll={handleScroll}
        className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-5 space-y-3.5 relative bg-gradient-to-b from-[#101722]/30 to-transparent"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A5B1C2]">
            <Users className="w-10 h-10 text-white/20 mb-2" />
            <p className="text-sm font-semibold text-white">Be the first to speak!</p>
            <p className="text-xs max-w-xs mt-1">
              Start the conversation. Share your live match predictions, reactions, and cheers.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.userId;
            const canDelete = isMe || isAdmin;

            return (
              <div
                key={msg.id}
                className={`group flex items-start gap-3 transition-colors ${
                  isMe ? 'flex-row-reverse' : ''
                }`}
              >
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B7FF]/30 to-[#151E2B] border border-white/15 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-white shadow-sm">
                  {msg.userAvatar ? (
                    <img
                      src={msg.userAvatar}
                      alt={msg.userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{msg.userName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[82%] sm:max-w-md flex flex-col ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] mb-1">
                    <span className="font-semibold text-white/90 truncate max-w-[120px]">
                      {msg.userName}
                    </span>
                    {msg.teamSupport && (
                      <span className="px-1.5 py-0.2 rounded bg-[#00B7FF]/15 text-[#00B7FF] font-mono text-[9px] font-bold">
                        {msg.teamSupport}
                      </span>
                    )}
                    <span className="text-[10px] text-[#A5B1C2] font-mono">
                      {formatTime(msg.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        title="Delete message"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#A5B1C2] hover:text-red-400 transition-opacity ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm break-words leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#00B7FF] text-[#080B12] font-medium rounded-tr-xs'
                        : 'bg-[#1E293B] text-white/95 border border-white/10 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />

        {/* Jump to bottom button when scrolled up */}
        {hasScrolledUp && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#00B7FF] text-[#080B12] text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce z-20"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>New messages below</span>
          </button>
        )}
      </div>

      {/* Quick Reaction Emojis Bar */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#101722]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-[#A5B1C2] uppercase font-mono shrink-0">Reactions:</span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addEmoji(emoji)}
            className="min-h-[30px] min-w-[30px] rounded-lg bg-white/5 hover:bg-white/15 text-sm flex items-center justify-center transition-all hover:scale-115 active:scale-95 shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Error Banner if any */}
      {errorBanner && (
        <div className="px-4 py-2 bg-red-500/15 border-t border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Chat Input or Sign-In Prompt */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#101722]/90">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Join the live discussion... (press Enter)"
              maxLength={500}
              disabled={isSubmitting}
              className="flex-1 min-h-[42px] px-4 rounded-xl bg-[#151E2B] border border-white/10 text-white placeholder-[#A5B1C2] text-xs sm:text-sm focus:outline-none focus:border-[#00B7FF] transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputText.trim()}
              className="min-h-[42px] min-w-[42px] px-4 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] disabled:opacity-40 disabled:hover:bg-[#00B7FF] text-[#080B12] font-bold flex items-center justify-center transition-colors shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#151E2B] border border-white/10">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-[#00B7FF] shrink-0 hidden sm:block" />
              <p className="text-xs text-[#A5B1C2]">
                <span className="text-white font-semibold">Sign in</span> to join the live match
                chat and cheer for your team.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => signInWithGoogle().catch(() => {})}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white text-[#080B12] text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
              <Link
                to="/auth"
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                Email
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
