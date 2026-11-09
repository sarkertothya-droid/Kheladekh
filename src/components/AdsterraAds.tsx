import React, { useEffect, useRef } from 'react';

/**
 * Adsterra 320x50 Banner Unit Component
 * Displays an asynchronous 320x50 mobile/desktop display banner.
 */
export const AdsterraBanner320x50: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous if re-rendered
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '320';
    iframe.height = '50';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.title = 'Adsterra 320x50 Banner';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '074ab4b2a5ca98920d433f3bcf2fe50d',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.topcreativeformat.com/074ab4b2a5ca98920d433f3bcf2fe50d/invoke.js"></script>
        </body>
      </html>
    `;

    container.appendChild(iframe);

    // Write content into iframe
    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    } catch (e) {
      console.warn('Adsterra iframe setup notice:', e);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-3 overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-[#A5B1C2]/60 mb-1 font-mono">ADVERTISEMENT</span>
      <div ref={containerRef} className="w-[320px] h-[50px] bg-black/20 rounded-lg flex items-center justify-center" />
    </div>
  );
};

/**
 * Adsterra Native Banner Unit (4 images in a row)
 * Container ID: container-c64a0227843897af2b96d7092feac269
 */
export const AdsterraNativeBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Load async script if not already present
    const existing = document.querySelector('script[src*="c64a0227843897af2b96d7092feac269"]');
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://bauval.org/21/c64a0227843897af2b96d7092feac269';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`my-6 p-4 rounded-2xl bg-[#101722] border border-white/10 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#00B7FF] font-mono">
          স্পন্সর কনটেন্ট (Sponsored Recommendations)
        </span>
        <span className="text-[9px] text-[#A5B1C2] font-mono">Adsterra Native</span>
      </div>
      <div id="container-c64a0227843897af2b96d7092feac269" className="min-h-[100px] w-full" />
    </div>
  );
};
