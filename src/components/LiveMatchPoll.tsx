import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { BarChart3, CheckCircle2, Lock, Users, Sparkles, LogIn } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Team } from '../types';

interface LiveMatchPollProps {
  eventId: string;
  teams?: Team[];
}

interface VoteDoc {
  userId: string;
  prediction: string;
  votedAt: string;
}

export const LiveMatchPoll: React.FC<LiveMatchPollProps> = ({ eventId, teams = [] }) => {
  const { user, signInWithGoogle } = useAuth();
  const [votes, setVotes] = useState<VoteDoc[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamA = teams[0]?.name || 'Team A';
  const teamB = teams[1]?.name || 'Team B';

  const pollOptions = [
    { id: 'teamA', label: `${teamA} to Win` },
    { id: 'draw', label: 'Draw / Tied Match' },
    { id: 'teamB', label: `${teamB} to Win` },
  ];

  // Listen to votes in real time
  useEffect(() => {
    if (!eventId) return;

    const votesRef = collection(db, 'events', eventId, 'votes');
    const unsubscribe = onSnapshot(votesRef, (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as VoteDoc);
      setVotes(items);

      if (user) {
        const myVote = items.find((v) => v.userId === user.uid);
        setUserVote(myVote ? myVote.prediction : null);
      }
    });

    return () => unsubscribe();
  }, [eventId, user]);

  const totalVotes = votes.length;

  const getVoteCount = (optId: string) => votes.filter((v) => v.prediction === optId).length;
  const getPercentage = (optId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(optId) / totalVotes) * 100);
  };

  const handleVote = async (optId: string) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const voteRef = doc(db, 'events', eventId, 'votes', user.uid);
      await setDoc(voteRef, {
        userId: user.uid,
        eventId,
        prediction: optId,
        votedAt: new Date().toISOString(),
      });
      setUserVote(optId);
    } catch (err) {
      console.warn('Failed to cast vote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 flex items-center justify-center text-[#00B7FF]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Live Fan Prediction Poll
            </h3>
            <p className="text-xs text-[#A5B1C2]">Who do you think will win this match?</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101722] border border-white/10 text-xs font-mono text-[#A5B1C2]">
          <Users className="w-3.5 h-3.5 text-[#00B7FF]" />
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {pollOptions.map((opt) => {
          const isSelected = userVote === opt.id;
          const percentage = getPercentage(opt.id);
          const count = getVoteCount(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              disabled={!user || isSubmitting}
              onClick={() => handleVote(opt.id)}
              className={`w-full relative overflow-hidden text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#00B7FF] bg-[#00B7FF]/10 text-white shadow-md'
                  : 'border-white/10 bg-[#101722] text-[#A5B1C2] hover:border-white/20'
              } disabled:cursor-pointer`}
            >
              {/* Progress bar background fill */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                  isSelected ? 'bg-[#00B7FF]/20' : 'bg-white/5'
                }`}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center justify-between z-10 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-semibold text-white">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00B7FF] shrink-0" />}
                  <span>{opt.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                  <span className="text-white font-bold">{percentage}%</span>
                  <span className="text-[11px] text-[#A5B1C2]">({count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Voter status or sign-in prompt */}
      {!user ? (
        <div className="p-3.5 rounded-xl bg-[#101722] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#A5B1C2]">
            <Sparkles className="w-4 h-4 text-[#00B7FF] shrink-0" />
            <span>Sign in to cast your vote and join the fan prediction leaderboard.</span>
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle().catch(() => {})}
            className="px-3 py-1.5 rounded-lg bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] font-bold text-xs flex items-center gap-1.5 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google Sign In</span>
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-[#A5B1C2] font-mono text-center">
          {userVote ? '✓ Your prediction is recorded in real time' : 'Click any option above to cast your vote'}
        </p>
      )}
    </div>
  );
};
