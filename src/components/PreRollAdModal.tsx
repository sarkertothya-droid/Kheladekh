import React, { useEffect, useState } from 'react';
import { ExternalLink, Shield, Timer, X } from 'lucide-react';
import { PreRollAdConfig } from '../types';
import { useData } from '../context/DataContext';
import { isSafeAdUrl, recordAdImpression, shouldDisplayAd } from '../services/adService';

interface PreRollAdModalProps {
  config?: PreRollAdConfig;
  isOpen: boolean;
  onClose: () => void;
  contextText?: string;
  forcePreview?: boolean;
}

export const PreRollAdModal: React.FC<PreRollAdModalProps> = ({
  config,
  isOpen,
  onClose,
  contextText,
  forcePreview = false,
}) => {
  const { settings } = useData();
  const activeConfig = config || settings.preRollAd;
  const duration = Math.max(0, Math.min(30, Number(activeConfig?.durationSeconds ?? 5)));
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);

  const adsAllowed =
    forcePreview ||
    (settings.adFreeMode === false &&
      Boolean(settings.adControl?.adsEnabled) &&
      Boolean(activeConfig?.enabled));

  const safeTargetUrl =
    isSafeAdUrl(activeConfig?.targetUrl) ||
    isSafeAdUrl(settings.adControl?.smartlinkUrl);
  const safeImageUrl = isSafeAdUrl(activeConfig?.imageUrl);

  const frequencyHours = Math.max(1, Number(activeConfig?.frequencyHours ?? 12));
  const [eligible, setEligible] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    if (forcePreview) {
      setEligible(true);
      setSecondsLeft(duration);
      return;
    }
    const canShow = shouldDisplayAd(frequencyHours);
    setEligible(canShow);
    if (canShow && adsAllowed) {
      setSecondsLeft(duration);
      recordAdImpression();
    }
  }, [isOpen, forcePreview, frequencyHours, duration, adsAllowed]);

  useEffect(() => {
    if (!isOpen || !adsAllowed || !eligible) return;
    if (secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, adsAllowed, eligible, secondsLeft]);

  if (!isOpen || !adsAllowed || !eligible) {
    return null;
  }

  const brandName = settings.siteName?.trim() || 'KhelaDekH';
  const title = activeConfig?.title?.trim() || `${brandName} Partner Spotlight`;
  const description =
    activeConfig?.description?.trim() ||
    'Support live sports broadcasts by visiting our featured sponsor.';
  const badgeText = activeConfig?.badgeText?.trim() || 'SPONSORED';
  const ctaText = activeConfig?.ctaText?.trim() || 'Visit Sponsor';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B12]/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Sponsor message"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0F1623] border border-white/[0.1] overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="px-5 py-3.5 bg-[#141D2E] border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
              {badgeText}
            </span>
            {contextText && (
              <span className="text-xs text-[#94A3B8] truncate">{contextText}</span>
            )}
          </div>

          {secondsLeft > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#CBD5E1] tabular-nums shrink-0">
              <Timer className="w-3.5 h-3.5 text-[#00B7FF]" />
              {secondsLeft}s
            </span>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Skip / Close
            </button>
          )}
        </div>

        {/* Media preview */}
        {safeImageUrl && (
          <div className="w-full aspect-[16/9] bg-[#080B12] overflow-hidden border-b border-white/[0.08]">
            <img
              src={safeImageUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-display text-xl font-bold text-white leading-snug">
              {title}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {safeTargetUrl ? (
              <a
                href={safeTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B]">
                <Shield className="w-3.5 h-3.5 text-[#16D98A]" />
                No sponsor target URL configured yet
              </span>
            )}

            <button
              type="button"
              disabled={secondsLeft > 0}
              onClick={onClose}
              className="min-h-[42px] px-4 py-2.5 rounded-xl bg-[#141D2E] border border-white/10 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-45 disabled:cursor-not-allowed transition-colors tabular-nums"
            >
              {secondsLeft > 0
                ? `Continue to Stream (${secondsLeft}s)`
                : 'Continue to Stream'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
