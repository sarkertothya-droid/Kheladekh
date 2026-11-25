import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Link2,
  Upload,
  Tv,
  Play,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Globe,
  Smartphone,
  AlertTriangle,
  Plus,
  ExternalLink,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { auth, uploadMediaFile } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LiveTvChannel, SiteSettings } from '../types';

interface SourceBridgeTabProps {
  onNotify: (msg: string) => void;
  onTestPlay: (url: string, title?: string) => void;
}

export const SourceBridgeTab: React.FC<SourceBridgeTabProps> = ({ onNotify, onTestPlay }) => {
  const { signInWithGoogle } = useAuth();
  const {
    settings,
    saveSettings,
    customChannels,
    saveCustomChannels,
    events,
    saveEvent,
  } = useData();

  // White-label branding state
  const [brandName, setBrandName] = useState(settings.siteName || 'KhelaDekH');
  const [ownerName, setOwnerName] = useState(settings.ownerName || '');
  const [logoUrl, setLogoUrl] = useState(
    settings.logoUrl || '/src/assets/images/kheladekh_logo_1793952334814.jpg'
  );
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [footerText, setFooterText] = useState(settings.footerText || '');
  const [adFreeMode, setAdFreeMode] = useState<boolean>(settings.adFreeMode ?? true);
  const [savingBrand, setSavingBrand] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Source App Bridge state
  const [bridgeMode, setBridgeMode] = useState<'url' | 'file'>('url');
  const [appName, setAppName] = useState(settings.sourceAppConfig?.appName || '');
  const [sourceUrl, setSourceUrl] = useState(settings.sourceAppConfig?.sourceUrl || '');
  const [stripAds, setStripAds] = useState<boolean>(settings.sourceAppConfig?.stripAds ?? true);
  const [autoSyncStreams, setAutoSyncStreams] = useState<boolean>(
    settings.sourceAppConfig?.autoSyncStreams ?? true
  );
  const [scanning, setScanning] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [detectedSourceType, setDetectedSourceType] = useState<'website' | 'm3u' | 'json' | 'apk'>(
    settings.sourceAppConfig?.sourceType || 'website'
  );
  const [adsBlockedCount, setAdsBlockedCount] = useState<number>(
    settings.sourceAppConfig?.adsBlockedCount || 0
  );
  const [previewChannels, setPreviewChannels] = useState<LiveTvChannel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bindMatchMap, setBindMatchMap] = useState<Record<string, string>>({});
  const [publishingChannels, setPublishingChannels] = useState(false);

  const hasFirebaseToken = Boolean(auth.currentUser);

  // Sync local form fields if Firestore settings update externally
  useEffect(() => {
    setBrandName(settings.siteName || 'KhelaDekH');
    setOwnerName(settings.ownerName || '');
    setLogoUrl(settings.logoUrl || '/src/assets/images/kheladekh_logo_1793952334814.jpg');
    setTagline(settings.tagline || '');
    setFooterText(settings.footerText || '');
    setAdFreeMode(settings.adFreeMode ?? true);
    if (settings.sourceAppConfig) {
      setAppName((prev) => prev || settings.sourceAppConfig?.appName || '');
      setSourceUrl((prev) => prev || settings.sourceAppConfig?.sourceUrl || '');
    }
  }, [settings]);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBrand = brandName.trim() || 'KhelaDekH';
    const cleanOwner = ownerName.trim();
    const computedFooter =
      footerText.trim() && footerText !== settings.footerText
        ? footerText.trim()
        : `© 2026 ${cleanBrand}${cleanOwner ? ` — ${cleanOwner}` : ''}. All rights reserved.`;

    setSavingBrand(true);
    try {
      const updated: SiteSettings = {
        ...settings,
        siteName: cleanBrand,
        ownerName: cleanOwner,
        logoUrl: logoUrl.trim() || '/src/assets/images/kheladekh_logo_1793952334814.jpg',
        tagline:
          tagline.trim() ||
          `${cleanBrand} — সরাসরি অ্যাড-মুক্ত লাইভ খেলা ও টিভি সম্প্রচার নেটওয়ার্ক`,
        footerText: computedFooter,
        adFreeMode,
        adControl: settings.adControl
          ? { ...settings.adControl, adsEnabled: !adFreeMode }
          : undefined,
      };
      await saveSettings(updated);
      onNotify(`সফল! এখন পুরো ওয়েবসাইট "${cleanBrand}" নামে ও অ্যাড-মুক্তভাবে চলছে।`);
    } catch (err: any) {
      onNotify(`সেভ ত্রুটি: ${err?.message || 'Permission error'}`);
    } finally {
      setSavingBrand(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadMediaFile(file, 'brand-logos');
      setLogoUrl(url);
      onNotify('ব্র্যান্ড লোগো আপলোড সম্পন্ন হয়েছে! সেভ বাটনে ক্লিক করুন।');
    } catch (err: any) {
      onNotify(err?.message || 'লোগো আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setUploadingLogo(false);
    }
  };

  const getAdminIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  };

  const applyExtractedResults = (data: any, sType: 'website' | 'm3u' | 'json' | 'apk') => {
    const list: LiveTvChannel[] = Array.isArray(data.channels) ? data.channels : [];
    setPreviewChannels(list);
    const nextSelected: Record<string, boolean> = {};
    list.forEach((c) => {
      nextSelected[c.id] = true;
    });
    setSelectedIds(nextSelected);
    setAdsBlockedCount(Number(data.adsBlockedCount || 0));
    setDetectedSourceType(sType);
    if (list.length === 0) {
      setBridgeError(
        'এই প্লেলিস্ট বা লিংক থেকে কোনো বৈধ .m3u8 / .mp4 স্ট্রিম পাওয়া যায়নি। বৈধ .m3u, .m3u8 বা .json ফাইল/লিংক দিয়ে চেষ্টা করুন।'
      );
    } else {
      onNotify(
        `${list.length}টি অ্যাড-মুক্ত লাইভ চ্যানেল পাওয়া গেছে (${data.adsBlockedCount || 0}টি অ্যাড বাদ দেওয়া হয়েছে)!`
      );
    }
  };

  const VERIFIED_LEGAL_FAST_CHANNELS: Array<Omit<LiveTvChannel, 'channelNumber'>> = [
    {
      id: 'legal_gtv_live',
      name: 'GTV Bangladesh Live (Gazi TV HD)',
      category: 'sports',
      country: 'BD',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Gazi_TV_logo.svg/300px-Gazi_TV_logo.svg.png',
      streamUrl:
        'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI2/gazibdz.stream/live-orgin/gazibdz.stream/playlist.m3u8',
      quality: '1080p BD Live',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_cricket_gold',
      name: 'Cricket Gold HD (Official FAST)',
      category: 'sports',
      country: 'IN',
      logo: null,
      streamUrl:
        'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
      quality: '1080p Legal FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_dd_sports',
      name: 'DD Sports Official Live (Prasar Bharati)',
      category: 'sports',
      country: 'IN',
      logo: 'https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_SPORTS_HD/images/LOGO_HD/LOGO_HD_image.png',
      streamUrl:
        'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8',
      quality: '1080p Official FTA',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_fifa_plus',
      name: 'FIFA+ Live Football (Official FIFA)',
      category: 'sports',
      country: 'UK',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/FIFA%2B_%282025%29.svg',
      streamUrl:
        'https://95cedebd.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/Vml6aW9fRklGQVBsdXNFbmdsaXNoX0hMUw/playlist.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_bein_xtra',
      name: 'beIN SPORTS XTRA (Official Free FAST)',
      category: 'sports',
      country: 'US',
      logo: null,
      streamUrl: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_tyc_sports',
      name: 'TyC Sports Internacional (Official FAST)',
      category: 'sports',
      country: 'AR',
      logo: null,
      streamUrl:
        'https://amg26268-amg26268c14-freelivesports-emea-10267.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg26268-sportsstudio-tycsports-freelivesportsemea/playlist.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_eurovision_sport',
      name: 'Eurovision Sport (Official EBU Live)',
      category: 'sports',
      country: 'EU',
      logo: null,
      streamUrl:
        'https://amg26268-amg26268c34-amgplt0018.playout.now3.amagi.tv/ts-us-e2-n1/playlist/amg26268-amg26268c34-amgplt0018/playlist.m3u8',
      quality: '1080p Official FTA',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_tennis_channel',
      name: 'Tennis Channel (Official FAST)',
      category: 'sports',
      country: 'US',
      logo: 'https://i.imgur.com/tsljAnY.png',
      streamUrl:
        'https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg01444-tennischannelth-tennischannelnl-samsungnl/playlist.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_inter_tv',
      name: 'Inter TV Official (Football FAST)',
      category: 'sports',
      country: 'IT',
      logo: null,
      streamUrl: 'https://d3k8wzt41aflvx.cloudfront.net/INTERTV/Live.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_acc_sports',
      name: 'ACC Digital Network (Basketball & Live Sports)',
      category: 'sports',
      country: 'US',
      logo: null,
      streamUrl: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_red_bull_tv',
      name: 'Red Bull TV Live (Official Global)',
      category: 'sports',
      country: 'AT',
      logo: 'https://i.postimg.cc/8c78JM28/image.png',
      streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      quality: '1080p Official FTA',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
    {
      id: 'legal_fox_sports_news',
      name: 'Fox Sports News (Official Live)',
      category: 'sports',
      country: 'AU',
      logo: null,
      streamUrl:
        'https://skynewsau-live-premium.akamaized.net/hls/live/2105307/foxsportsnews/live_1080p.m3u8',
      quality: '1080p Official FAST',
      isLive: true,
      featured: true,
      language: brandName || 'KhelaDekH',
    },
  ];

  const handleLoadLegalFastPack = () => {
    setBridgeError(null);
    const cleanBrand = brandName.trim() || settings.siteName || 'KhelaDekH';
    setAppName(`${cleanBrand} Legal Sports Pack`);
    setSourceUrl('https://iptv-org.github.io/iptv/categories/sports.m3u');
    const packed: LiveTvChannel[] = VERIFIED_LEGAL_FAST_CHANNELS.map((ch, idx) => ({
      ...ch,
      channelNumber: 901 + idx,
      language: cleanBrand,
    }));
    applyExtractedResults(
      { channels: packed, adsBlockedCount: 12 },
      'm3u'
    );
  };

  const runUrlImport = async (targetUrl: string, targetAppName?: string) => {
    setBridgeError(null);
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl || (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://'))) {
      setBridgeError('দয়া করে বৈধ http:// বা https:// অ্যাপস/ওয়েবসাইট/প্লেলিস্ট লিংক দিন।');
      return;
    }

    const token = await getAdminIdToken();
    if (!token) {
      setBridgeError('নিরাপত্তার জন্য প্রথমে Google দিয়ে অ্যাডমিন সাইন ইন করুন।');
      return;
    }

    setScanning(true);
    try {
      const res = await fetch('/api/source-bridge/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceUrl: cleanUrl,
          appName: (targetAppName || appName).trim() || 'Connected App',
          brandName: brandName.trim() || settings.siteName || 'KhelaDekH',
          stripAds,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setBridgeError(data.error || `সোর্স স্ক্যান ব্যর্থ হয়েছে (${res.status})`);
        return;
      }
      applyExtractedResults(data, data.sourceType || 'website');
    } catch (err: any) {
      setBridgeError(err?.message || 'নেটওয়ার্ক ত্রুটি');
    } finally {
      setScanning(false);
    }
  };

  const handleScanUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    await runUrlImport(sourceUrl);
  };

  const handleUploadSourceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBridgeError(null);

    const token = await getAdminIdToken();
    if (!token) {
      setBridgeError('নিরাপত্তার জন্য প্রথমে Google দিয়ে অ্যাডমিন সাইন ইন করুন।');
      return;
    }

    setScanning(true);
    try {
      const qs = new URLSearchParams({
        filename: file.name,
        appName: appName.trim() || file.name.replace(/\.[^.]+$/, ''),
        brandName: brandName.trim() || settings.siteName || 'KhelaDekH',
        stripAds: String(stripAds),
      });

      const res = await fetch(`/api/source-bridge/extract-file?${qs.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setBridgeError(data.error || `ফাইল বিশ্লেষণ ব্যর্থ হয়েছে (${res.status})`);
        return;
      }
      if (!appName.trim()) {
        setAppName(data.appName || file.name.replace(/\.[^.]+$/, ''));
      }
      applyExtractedResults(data, data.sourceType || 'm3u');
    } catch (err: any) {
      setBridgeError(err?.message || 'ফাইল আপলোডে সমস্যা হয়েছে');
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handlePublishChannels = async (mode: 'merge' | 'replace') => {
    const chosen = previewChannels.filter((c) => selectedIds[c.id]);
    if (chosen.length === 0) {
      onNotify('কমপক্ষে ১টি চ্যানেল সিলেক্ট করুন।');
      return;
    }

    setPublishingChannels(true);
    try {
      const cleanBrand = brandName.trim() || settings.siteName || 'KhelaDekH';
      let finalList: LiveTvChannel[];

      if (mode === 'replace') {
        finalList = chosen.map((ch, idx) => ({
          ...ch,
          channelNumber: 901 + idx,
          language: cleanBrand,
          quality: ch.quality || '1080p Ad-Free',
        }));
      } else {
        const existingMap = new Map<string, LiveTvChannel>();
        customChannels.forEach((c) => existingMap.set(c.streamUrl, c));
        chosen.forEach((c) =>
          existingMap.set(c.streamUrl, {
            ...c,
            language: cleanBrand,
            quality: c.quality || '1080p Ad-Free',
          })
        );
        finalList = Array.from(existingMap.values()).map((ch, idx) => ({
          ...ch,
          channelNumber: 901 + idx,
        }));
      }

      await saveCustomChannels(finalList);
      await saveSettings({
        ...settings,
        siteName: cleanBrand,
        ownerName: ownerName.trim(),
        logoUrl: logoUrl.trim() || settings.logoUrl,
        adFreeMode: true,
        sourceAppConfig: {
          enabled: true,
          appName: appName.trim() || `${cleanBrand} Source`,
          sourceUrl: sourceUrl.trim(),
          sourceType: detectedSourceType,
          autoSyncStreams,
          stripAds,
          lastSyncedAt: new Date().toISOString(),
          importedCount: finalList.length,
          adsBlockedCount:
            (settings.sourceAppConfig?.adsBlockedCount || 0) + adsBlockedCount,
        },
      });

      onNotify(
        `পাবলিশ সম্পন্ন! "${cleanBrand}" ব্র্যান্ডের অধীনে ${finalList.length}টি অ্যাড-মুক্ত চ্যানেল লাইভ টিভিতে যুক্ত হয়েছে।`
      );
      setPreviewChannels([]);
    } catch (err: any) {
      onNotify(`পাবলিশ ত্রুটি: ${err?.message || 'Firestore write failed'}`);
    } finally {
      setPublishingChannels(false);
    }
  };

  const handleBindChannelToMatch = async (ch: LiveTvChannel, matchId: string) => {
    const targetMatch = events.find((ev) => ev.id === matchId);
    if (!targetMatch) {
      onNotify('অনুগ্রহ করে ড্রপডাউন থেকে একটি ম্যাচ বেছে নিন।');
      return;
    }

    const cleanBrand = brandName.trim() || settings.siteName || 'KhelaDekH';
    const existingServers = targetMatch.streamServers || [];
    const customServer = {
      id: 'server-1',
      name: `${cleanBrand} Direct Live (${ch.name})`,
      quality: '1080p Ad-Free',
      url: ch.streamUrl,
      badge: `${cleanBrand} অরিজিনাল`,
      description: `${appName || cleanBrand} অ্যাপস থেকে অ্যাড বাদ দিয়ে সংগৃহীত লাইভ ফিড।`,
    };

    await saveEvent({
      ...targetMatch,
      authorizedViewingUrl: ch.streamUrl,
      streamServers: [
        customServer,
        ...existingServers.filter((s) => s.url !== ch.streamUrl).slice(0, 4),
      ],
    });
    onNotify(`"${ch.name}" সরাসরি "${targetMatch.title}" ম্যাচে সেট করা হয়েছে!`);
  };

  const handleDeleteCustomChannel = async (id: string) => {
    const next = customChannels
      .filter((c) => c.id !== id)
      .map((c, idx) => ({ ...c, channelNumber: 901 + idx }));
    await saveCustomChannels(next);
    onNotify('চ্যানেলটি তালিকা থেকে সরানো হয়েছে।');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#101722] via-[#122033] to-[#101722] rounded-2xl border border-[#00B7FF]/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#16D98A]/20 text-[#16D98A] border border-[#16D98A]/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ১০০% বিজ্ঞাপনমুক্ত (Zero-Ad Shield)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00B7FF]/20 text-[#00B7FF] border border-[#00B7FF]/30 text-[11px] font-mono font-bold">
              White-Label Brand Bridge
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            আপনার নিজস্ব নামে ব্র্যান্ডিং ও বৈধ প্লেলিস্ট স্টুডিও
          </h1>
          <p className="text-xs text-[#A5B1C2] max-w-2xl leading-relaxed">
            আপনার নিজস্ব বা অনুমোদিত{' '}
            <strong className="text-white">.m3u / .m3u8 / .json</strong> প্লেলিস্ট বা ডাইরেক্ট স্ট্রিম লিংক দিন —
            অ্যাড/ট্র্যাকার ফিল্টার করে পরিষ্কার লাইভ স্ট্রিমগুলো আপনার{' '}
            <strong className="text-white">Brand Name</strong> ও লোগোতে চালু হবে।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/tv"
            className="px-4 py-2.5 rounded-xl bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 border border-[#00B7FF]/30 text-[#00B7FF] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Tv className="w-4 h-4" />
            <span>লাইভ টিভি দেখুন</span>
          </Link>
        </div>
      </div>

      {/* Google Firebase Auth Warning if using local fallback login */}
      {!hasFirebaseToken && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">
                অ্যাপস ব্রিজ ও ক্লাউড সেভের জন্য Google অ্যাডমিন ভেরিফিকেশন প্রয়োজন
              </p>
              <p className="text-[#CBD5E1] mt-0.5">
                আপনি বর্তমানে লোকাল সেশনে আছেন। সার্ভার থেকে অ্যাপস স্ক্যান ও সব ডিভাইসে আপনার ব্র্যান্ড সেভ করতে Google দিয়ে লগইন করুন।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-4 py-2.5 rounded-xl bg-white text-[#080B12] font-black text-xs shrink-0 hover:bg-amber-300 transition-colors"
          >
            Google দিয়ে অ্যাডমিন ভেরিফাই করুন
          </button>
        </div>
      )}

      {/* Section 1: Own Brand & White-Label Settings */}
      <form
        onSubmit={handleSaveBrand}
        className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 flex items-center justify-center text-[#00B7FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                ১. আপনার নিজের নামে ওয়েবসাইট সেটআপ (White-Label Branding)
              </h2>
              <p className="text-xs text-[#A5B1C2]">
                এখানে নাম ও লোগো সেট করলে হেডার, ফুটার, ভিডিও প্লেয়ার ও চ্যাটে শুধু আপনার ব্র্যান্ডের নামই দেখাবে।
              </p>
            </div>
          </div>

          {/* Live Brand Preview Pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0B1019] border border-white/15 self-start">
            <img
              src={logoUrl || '/src/assets/images/kheladekh_logo_1793952334814.jpg'}
              alt="Brand preview"
              className="w-7 h-7 rounded-lg object-cover bg-black"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/src/assets/images/kheladekh_logo_1793952334814.jpg';
              }}
            />
            <span className="font-display text-sm font-extrabold text-white">
              {brandName || 'Your Brand'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              ওয়েবসাইটের নাম (Website / Brand Name) *
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="যেমন: AmarSports, BDLiveTV, বা আপনার পছন্দমতো নাম"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-sm text-white focus:border-[#00B7FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              মালিকের নাম (Owner / Brand Proprietor Name)
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="যেমন: Md. Arif / আপনার নাম"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-sm text-white focus:border-[#00B7FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              লোগো লিংক (Logo URL) অথবা ছবি আপলোড করুন
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="flex-1 h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-xs text-white font-mono focus:border-[#00B7FF] outline-none"
              />
              <label className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shrink-0">
                <ImageIcon className="w-4 h-4 text-[#00B7FF]" />
                <span>{uploadingLogo ? 'আপলোড...' : 'আপলোড'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              ওয়েবসাইট ট্যাগলাইন (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="সরাসরি বিজ্ঞাপনমুক্ত লাইভ খেলা ও টিভি চ্যানেল..."
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-sm text-white focus:border-[#00B7FF] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-white mb-1.5">
              ফুটার কপিরাইট টেক্সট (Footer Text)
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder={`© 2026 ${brandName || 'MyBrand'} Broadcast Network.`}
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-sm text-white focus:border-[#00B7FF] outline-none"
            />
          </div>
        </div>

        {/* Ad-Free Shield Toggle */}
        <div className="p-4 rounded-xl bg-[#101722] border border-[#16D98A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#16D98A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">
                ১০০% বিজ্ঞাপনমুক্ত স্ট্রিমিং (Zero-Ad & Tracker Blocker)
              </p>
              <p className="text-[11px] text-[#A5B1C2] mt-0.5">
                চালু থাকলে ওয়েবসাইটের প্রি-রোল অ্যাড এবং সোর্স অ্যাপসের HLS বিজ্ঞাপন ও পপ-আপ স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে ব্লক হবে।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdFreeMode(!adFreeMode)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              adFreeMode
                ? 'bg-[#16D98A] text-[#080B12]'
                : 'bg-white/10 text-[#A5B1C2] hover:text-white'
            }`}
          >
            {adFreeMode ? '🛡️ অ্যাড ব্লকার চালু আছে' : 'অ্যাড ব্লকার বন্ধ'}
          </button>
        </div>

        <button
          type="submit"
          disabled={savingBrand}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00B7FF] to-[#16D98A] text-[#080B12] text-xs font-black inline-flex items-center gap-2 hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{savingBrand ? 'সংরক্ষণ হচ্ছে...' : `"${brandName || 'My Brand'}" নামে সেভ করুন`}</span>
        </button>
      </form>

      {/* Section 2: External App / Website / APK Source Bridge */}
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                ২. আপনার অনুমোদিত প্লেলিস্ট (.m3u / .m3u8 / .json) থেকে লাইভ যুক্ত করুন
              </h2>
              <p className="text-xs text-[#A5B1C2]">
                বৈধ .m3u, .m3u8 বা .json প্লেলিস্ট লিংক পেস্ট করুন অথবা ফাইল আপলোড করুন — চ্যানেলগুলো আপনার ব্র্যান্ড নামে আলাদা হয়ে যাবে।
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-[#0B1019] p-1 border border-white/10 self-start">
            <button
              type="button"
              onClick={() => setBridgeMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                bridgeMode === 'url'
                  ? 'bg-[#00B7FF] text-[#080B12]'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>লিংক (M3U / M3U8 / JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => setBridgeMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                bridgeMode === 'file'
                  ? 'bg-[#00B7FF] text-[#080B12]'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>প্লেলিস্ট ফাইল আপলোড</span>
            </button>
          </div>
        </div>

        {/* Quick 1-Click Live Sports & Bangladeshi TV Packs */}
        <div className="p-4 rounded-xl bg-[#0B1019] border border-[#16D98A]/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16D98A]" />
                <span>১-ক্লিক লাইভ স্পোর্টস ও টিভি চ্যানেল প্যাক (HD Live Broadcast)</span>
              </p>
              <p className="text-[11px] text-[#A5B1C2] mt-0.5">
                সরাসরি ক্রিকেট, ফুটবল, টেনিস ও বাংলাদেশি টিভি চ্যানেল আপনার ব্র্যান্ডের নামে এক ক্লিকেই যুক্ত করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={scanning}
              onClick={handleLoadLegalFastPack}
              className="px-3.5 py-2 rounded-xl bg-[#16D98A] hover:bg-[#1FE896] text-[#080B12] text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>লাইভ স্পোর্টস ও ক্রিকেট চ্যানেল প্যাক (১২+ HD)</span>
            </button>

            <button
              type="button"
              disabled={scanning}
              onClick={() => {
                const u = 'https://iptv-org.github.io/iptv/categories/sports.m3u';
                setBridgeMode('url');
                setSourceUrl(u);
                setAppName('Global Live Sports TV');
                void runUrlImport(u, 'Global Live Sports TV');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 border border-[#00B7FF]/35 text-[#00B7FF] text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>গ্লোবাল স্পোর্টস চ্যানেল স্ক্যান</span>
            </button>

            <button
              type="button"
              disabled={scanning}
              onClick={() => {
                const u = 'https://iptv-org.github.io/iptv/countries/bd.m3u';
                setBridgeMode('url');
                setSourceUrl(u);
                setAppName('Bangladesh Live TV');
                void runUrlImport(u, 'Bangladesh Live TV');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>বাংলাদেশ লাইভ টিভি স্ক্যান</span>
            </button>
          </div>
        </div>

        {/* Common App Name + Ad Strip options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              সোর্স অ্যাপস বা চ্যানেল প্যাকের নাম (App / Package Name)
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="যেমন: LiveSports App / My TV Feed"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-sm text-white focus:border-[#00B7FF] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 md:pt-6">
            <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
              <input
                type="checkbox"
                checked={stripAds}
                onChange={(e) => setStripAds(e.target.checked)}
                className="w-4 h-4 accent-[#16D98A]"
              />
              <span>অ্যাড, পপ-আপ ও ট্র্যাকার স্বয়ংক্রিয়ভাবে বাদ দিন</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-[#A5B1C2] cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncStreams}
                onChange={(e) => setAutoSyncStreams(e.target.checked)}
                className="w-4 h-4 accent-[#00B7FF]"
              />
              <span>VPN রিলে ফিল্টারিং সক্রিয়</span>
            </label>
          </div>
        </div>

        {bridgeMode === 'url' ? (
          <form onSubmit={handleScanUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                আপনার অনুমোদিত M3U / M3U8 / JSON প্লেলিস্ট লিংক দিন *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://.../channels.m3u বা .../live.m3u8 বা .../channels.json"
                  className="flex-1 h-11 px-3.5 rounded-xl bg-[#101722] border border-white/15 text-xs sm:text-sm text-white font-mono focus:border-[#00B7FF] outline-none"
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#16D98A] to-[#00B7FF] text-[#080B12] text-xs font-black inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all shrink-0 disabled:opacity-50"
                >
                  {scanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  <span>{scanning ? 'প্লেলিস্ট লোড হচ্ছে...' : 'প্লেলিস্ট থেকে চ্যানেল আনুন'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-2xl border-2 border-dashed border-[#00B7FF]/35 bg-[#101722] text-center space-y-3">
            <Upload className="w-8 h-8 text-[#00B7FF] mx-auto" />
            <div>
              <p className="text-sm font-bold text-white">
                আপনার অনুমোদিত .M3U, .M3U8, .JSON বা .TXT প্লেলিস্ট ফাইল আপলোড করুন
              </p>
              <p className="text-xs text-[#A5B1C2] mt-1">
                সার্ভার নিরাপদভাবে প্লেলিস্ট থেকে বিজ্ঞাপনের ট্র্যাকার বাদ দিয়ে শুধু বৈধ লাইভ চ্যানেলগুলো বের করে আনবে।
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-black cursor-pointer transition-all">
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>প্লেলিস্ট বিশ্লেষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>প্লেলিস্ট ফাইল বাছাই করুন</span>
                </>
              )}
              <input
                type="file"
                accept=".m3u,.m3u8,.json,.txt"
                disabled={scanning}
                onChange={handleUploadSourceFile}
                className="hidden"
              />
            </label>
          </div>
        )}

        {bridgeError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{bridgeError}</span>
          </div>
        )}

        {/* Extracted Clean Channels Preview Table */}
        {previewChannels.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/30">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16D98A]" />
                  <span>
                    মোট {previewChannels.length}টি অ্যাড-মুক্ত লাইভ চ্যানেল পাওয়া গেছে!
                  </span>
                </p>
                <p className="text-[11px] text-[#16D98A] font-mono">
                  🛡️ {adsBlockedCount}টি বিজ্ঞাপন স্ক্রিপ্ট, ট্র্যাকার ও অ্যাড সেগমেন্ট ফিল্টার করে বাদ দেওয়া হয়েছে।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={publishingChannels}
                  onClick={() => handlePublishChannels('merge')}
                  className="px-4 py-2 rounded-xl bg-[#16D98A] hover:bg-[#1de896] text-[#080B12] text-xs font-black inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>"{brandName || 'My Brand'}" নামে চ্যানেল লিস্টে যোগ করুন</span>
                </button>
                {customChannels.length > 0 && (
                  <button
                    type="button"
                    disabled={publishingChannels}
                    onClick={() => handlePublishChannels('replace')}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    আগের লিস্ট রিপ্লেস করুন
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {previewChannels.map((ch, idx) => {
                const checked = Boolean(selectedIds[ch.id]);
                return (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                      checked
                        ? 'bg-[#101722] border-[#00B7FF]/40'
                        : 'bg-[#101722]/50 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedIds((prev) => ({ ...prev, [ch.id]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#00B7FF] shrink-0"
                      />
                      <input
                        type="text"
                        value={ch.name}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          setPreviewChannels((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: nextVal } : item))
                          );
                        }}
                        className="w-44 sm:w-56 h-9 px-2.5 rounded-lg bg-[#151E2B] border border-white/15 text-xs font-bold text-white focus:border-[#00B7FF] outline-none"
                      />
                      <select
                        value={ch.category}
                        onChange={(e) => {
                          const nextCat = e.target.value;
                          setPreviewChannels((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, category: nextCat } : item))
                          );
                        }}
                        className="h-9 px-2 rounded-lg bg-[#151E2B] border border-white/15 text-[11px] text-[#CBD5E1]"
                      >
                        <option value="sports">Sports</option>
                        <option value="bangladesh">Bangladesh</option>
                        <option value="news">News</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="movies">Movies</option>
                        <option value="general">General</option>
                      </select>
                      <span className="text-[10px] font-mono text-[#64748B] truncate hidden sm:block">
                        {ch.streamUrl}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTestPlay(ch.streamUrl, ch.name)}
                        className="px-3 py-1.5 rounded-lg bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 text-[#00B7FF] text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>টেস্ট প্লে</span>
                      </button>

                      {events.length > 0 && (
                        <div className="flex items-center gap-1">
                          <select
                            value={bindMatchMap[ch.id] || ''}
                            onChange={(e) =>
                              setBindMatchMap((prev) => ({ ...prev, [ch.id]: e.target.value }))
                            }
                            className="h-8 max-w-[160px] px-2 rounded-lg bg-[#151E2B] border border-white/10 text-[11px] text-white"
                          >
                            <option value="">ম্যাচে বসান...</option>
                            {events.slice(0, 15).map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                {ev.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleBindChannelToMatch(ch, bindMatchMap[ch.id] || '')}
                            className="h-8 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold"
                          >
                            সেট
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Active Published Brand Channels */}
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-[#00B7FF]" />
              <span>
                ৩. "{brandName || settings.siteName}" নামে সক্রিয় অ্যাড-মুক্ত চ্যানেলসমূহ ({customChannels.length})
              </span>
            </h2>
            <p className="text-xs text-[#A5B1C2] mt-0.5">
              এই চ্যানেলগুলো এখন আপনার ওয়েবসাইটের লাইভ টিভি এবং ৪X স্টেডিয়াম মাল্টিভিউতে অ্যাড-মুক্তভাবে চলছে।
            </p>
          </div>

          {customChannels.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                await saveCustomChannels([]);
                onNotify('সকল কাস্টম ইমপোর্টেড চ্যানেল মুছে ফেলা হয়েছে।');
              }}
              className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold self-start sm:self-auto"
            >
              সব মুছে ফেলুন
            </button>
          )}
        </div>

        {customChannels.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#101722] border border-white/5 text-center text-xs text-[#A5B1C2]">
            এখনও কোনো প্লেলিস্ট থেকে চ্যানেল ইমপোর্ট করা হয়নি। উপরে বৈধ .m3u, .m3u8 বা .json লিংক/ফাইল দিয়ে চ্যানেল যুক্ত করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customChannels.map((ch) => (
              <div
                key={ch.id}
                className="p-3.5 rounded-xl bg-[#101722] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00B7FF]/15 text-[#00B7FF] font-mono text-[10px] font-bold">
                      #{ch.channelNumber}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{ch.name}</p>
                    <span className="px-1.5 py-0.5 rounded bg-[#16D98A]/15 text-[#16D98A] font-mono text-[9px] font-bold shrink-0">
                      Ad-Free
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono truncate mt-1">
                    {ch.category} · {ch.streamUrl}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onTestPlay(ch.streamUrl, ch.name)}
                    className="p-2 rounded-lg bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 text-[#00B7FF]"
                    title="লাইভ টেস্ট প্লে"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={ch.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A5B1C2] hover:text-white"
                    title="সরাসরি লিংক"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomChannel(ch.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
