import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AdControlConfig } from '../types';
import { isSafeAdUrl } from '../services/adService';

export const ADSTERRA_SMARTLINK_URL = '';

interface AdSlotProps {
  className?: string;
  previewOverride?: AdControlConfig;
}

export const AdsterraBanner320x50: React.FC<AdSlotProps> = ({
  className = '',
  previewOverride,
}) => {
  const { settings } = useData();
  const adConfig = previewOverride || settings.adControl;
  const isPreview = Boolean(previewOverride);

  if (!isPreview) {
    if (settings.adFreeMode !== false || !adConfig?.adsEnabled || !adConfig?.bannerEnabled) {
      return null;
    }
  } else if (!adConfig?.bannerEnabled) {
    return null;
  }

  const targetUrl = isSafeAdUrl(adConfig?.smartlinkUrl);
  const imageUrl = isSafeAdUrl(adConfig?.bannerImageUrl);
  const title = adConfig?.bannerTitle?.trim() || 'Featured Live Sports Offer';
  const subtitle = adConfig?.bannerSubtitle?.trim() || 'Sponsored Partner';
  const cta = adConfig?.bannerCta?.trim() || 'Visit';

  const cardInner = (
    <div className="w-full rounded-xl bg-[#0F1623] border border-white/[0.08] hover:border-[#00B7FF]/40 transition-colors px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-12 h-10 rounded-lg object-cover bg-[#080B12] border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#00B7FF]/10 border border-[#00B7FF]/25 text-[#00B7FF] flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
              AD
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white truncate">{title}</p>
          </div>
          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      <span className="px-3.5 py-1.5 rounded-lg bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-1.5 shrink-0">
        <span>{cta}</span>
        <ExternalLink className="w-3 h-3" />
      </span>
    </div>
  );

  if (targetUrl) {
    return (
      <div className={`w-full ${className}`}>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          {cardInner}
        </a>
      </div>
    );
  }

  return isPreview ? <div className={`w-full ${className}`}>{cardInner}</div> : null;
};

export const AdsterraNativeBanner: React.FC<AdSlotProps> = ({
  className = '',
  previewOverride,
}) => {
  const { settings } = useData();
  const adConfig = previewOverride || settings.adControl;
  const isPreview = Boolean(previewOverride);

  if (!isPreview) {
    if (settings.adFreeMode !== false || !adConfig?.adsEnabled || !adConfig?.nativeEnabled) {
      return null;
    }
  } else if (!adConfig?.nativeEnabled) {
    return null;
  }

  const targetUrl =
    isSafeAdUrl(adConfig?.nativeTargetUrl) || isSafeAdUrl(adConfig?.smartlinkUrl);
  const imageUrl = isSafeAdUrl(adConfig?.nativeImageUrl);
  const title = adConfig?.nativeTitle?.trim() || 'Partner Highlights & Match Offers';
  const description =
    adConfig?.nativeDescription?.trim() ||
    'Explore official partner promotions and exclusive match day deals.';
  const cta = adConfig?.nativeCta?.trim() || 'Open Offer';

  const cardInner = (
    <div className="rounded-2xl bg-[#0F1623] border border-white/[0.08] hover:border-[#00B7FF]/40 transition-colors p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl object-cover bg-[#080B12] border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            Sponsored Partner
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
          <p className="text-xs text-[#94A3B8] line-clamp-2">{description}</p>
        </div>
      </div>

      <span className="min-h-[38px] px-4 py-2 rounded-xl bg-[#141D2E] border border-[#00B7FF]/35 text-[#00B7FF] text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0">
        <span>{cta}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </span>
    </div>
  );

  if (targetUrl) {
    return (
      <div className={`w-full ${className}`}>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          {cardInner}
        </a>
      </div>
    );
  }

  return isPreview ? <div className={`w-full ${className}`}>{cardInner}</div> : null;
};
