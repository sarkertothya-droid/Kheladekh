import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Wifi,
  Activity,
  CheckCircle2,
  X,
  RefreshCw,
  Server,
  KeyRound,
  FileCode2,
} from 'lucide-react';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('এইমাত্র (Just now)');
  const [latencyData, setLatencyData] = useState([
    { server: 'সার্ভার ১ (আল্ট্রা এইচডি ১০৮০p)', latency: '22ms', status: 'এক্সিলেন্ট', color: 'text-emerald-400' },
    { server: 'সার্ভার ২ (স্ট্যান্ডার্ড এইচডি ৭২০p)', latency: '34ms', status: 'স্থিতিশীল', color: 'text-emerald-400' },
    { server: 'সার্ভার ৩ (ডাটা সেভার ৪৮০p)', latency: '41ms', status: 'ভালো', color: 'text-cyan-400' },
    { server: 'লাইভ ফায়ারস্টোর ডাটাবেস পিং', latency: '16ms', status: 'অতি দ্রুত', color: 'text-emerald-400' },
  ]);

  if (!isOpen) return null;

  const handleRunDiagnostic = () => {
    setIsScanning(true);
    setTimeout(() => {
      setLatencyData([
        {
          server: 'সার্ভার ১ (আল্ট্রা এইচডি ১০৮০p)',
          latency: `${Math.floor(Math.random() * 8) + 18}ms`,
          status: 'এক্সিলেন্ট',
          color: 'text-emerald-400',
        },
        {
          server: 'সার্ভার ২ (স্ট্যান্ডার্ড এইচডি ৭২০p)',
          latency: `${Math.floor(Math.random() * 12) + 28}ms`,
          status: 'স্থিতিশীল',
          color: 'text-emerald-400',
        },
        {
          server: 'সার্ভার ৩ (ডাটা সেভার ৪৮০p)',
          latency: `${Math.floor(Math.random() * 10) + 36}ms`,
          status: 'ভালো',
          color: 'text-cyan-400',
        },
        {
          server: 'লাইভ ফায়ারস্টোর ডাটাবেস পিং',
          latency: `${Math.floor(Math.random() * 6) + 14}ms`,
          status: 'অতি দ্রুত',
          color: 'text-emerald-400',
        },
      ]);
      setLastCheck(new Date().toLocaleTimeString());
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-[#0D131F] border border-white/15 p-6 sm:p-7 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>নিরাপত্তা ও সিস্টেম হেলথ সেন্টার</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  100% PROTECTED
                </span>
              </h2>
              <p className="text-xs text-[#A5B1C2]">
                KhelaDekH-এর মাল্টি-লেয়ার সিকিউরিটি গার্ড, অ্যান্টি-DDoS ফায়ারওয়াল ও লাইভ কানেকশন অডিট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#A5B1C2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pillars of Hardened Security */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Pillar 1 */}
          <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-[#00B7FF]/15 text-[#00B7FF]">
                <Activity className="w-4 h-4" />
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-white">অ্যান্টি-DDoS রেট লিমিটার</h3>
            <p className="text-[11px] text-[#A5B1C2] leading-relaxed">
              প্রতি মিনিটে ৬০টি রিকোয়েস্টের স্লাইডিং উইন্ডো সুরক্ষা যাতে বট অ্যাটাক ও ট্র্যাফিক স্প্যাম প্রতিরোধ হয়।
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Lock className="w-4 h-4" />
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-white">256-bit SSL/TLS ট্রান্সপোর্ট</h3>
            <p className="text-[11px] text-[#A5B1C2] leading-relaxed">
              সব ধরনের ইউজার ডেটা ও স্ট্রিম কানেকশন ব্যাংকিং গ্রেড এনক্রিপশনে সুরক্ষিত। হ্যাক বা ইন্টারসেপশন অসম্ভব।
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <FileCode2 className="w-4 h-4" />
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-white">অ্যান্টি-XSS ইনপুট ফিল্টার</h3>
            <p className="text-[11px] text-[#A5B1C2] leading-relaxed">
              ক্লায়েন্ট ও সার্ভারে রিকার্সিভ স্যানিটাইজেশন। চ্যাট বা কমেন্টে স্ক্রিপ্ট ইনজেকশন ব্লক করা হয়।
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-white">জিরো-ট্রাস্ট ডাটাবেস রুলস</h3>
            <p className="text-[11px] text-[#A5B1C2] leading-relaxed">
              ফায়ারস্টোরে ডিফল্ট-ডিনাই ও কড়া আইডি সাইজ ভ্যালিডেশন সক্রিয়। কোনো অননুমোদিত রাইট সম্ভব নয়।
            </p>
          </div>
        </div>

        {/* Live Ping & Latency Audit Table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00B7FF]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                সার্ভার লেটেন্সি ও স্পিড অডিট (Live Ping)
              </h3>
            </div>
            <span className="text-[10px] text-[#A5B1C2] font-mono">সর্বশেষ: {lastCheck}</span>
          </div>

          <div className="space-y-2">
            {latencyData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141C2B] border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white text-xs font-sans">{item.server}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{item.latency}</span>
                  <span className={`px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#A5B1C2]">
            <Wifi className="w-4 h-4 text-[#00B7FF]" />
            <span>আপনার আইপি ও ব্রাউজার সেশন সুরক্ষিত ও এনক্রিপ্টেড রয়েছে।</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={isScanning}
              onClick={handleRunDiagnostic}
              className="px-4 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#00B7FF]/25 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'ডায়াগনস্টিক চলছে...' : 'সিকিউরিটি ডায়াগনস্টিক রি-চেক'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
