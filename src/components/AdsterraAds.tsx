import React, { useEffect, useRef } from 'react';

export const ADSTERRA_SMARTLINK_URL =
  'https://www.profitableratecpmnetwork.com/ezzarzguc?key=b03d0150c9e5f312e521740071ad1243';

/**
 * Adsterra 320x50 Standard Banner
 * Key: 074ab4b2a5ca98920d433f3bcf2fe50d
 */
export const AdsterraBanner320x50: React.FC<{ className?: string }> = ({ className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; }
          </style>
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
          <script type="text/javascript" src="//www.topcreativeformat.com/074ab4b2a5ca98920d433f3bcf2fe50d/invoke.js"></script>
        </body>
      </html>
    `);
    doc.close();
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mb-1">
        Advertisement
      </span>
      <iframe
        ref={iframeRef}
        title="Adsterra 320x50 Banner"
        width={320}
        height={50}
        frameBorder={0}
        scrolling="no"
        className="w-[320px] h-[50px] overflow-hidden rounded bg-transparent"
      />
    </div>
  );
};

/**
 * Adsterra Native Banner
 * Script: https://bauval.org/21/c64a0227843897af2b96d7092feac269
 * Container: container-c64a0227843897af2b96d7092feac269
 */
export const AdsterraNativeBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script is already present
    const existingScript = document.querySelector('script[src*="c64a0227843897af2b96d7092feac269"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://bauval.org/21/c64a0227843897af2b96d7092feac269';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full my-4 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mb-1">
        Sponsored
      </span>
      <div
        id="container-c64a0227843897af2b96d7092feac269"
        ref={containerRef}
        className="w-full min-h-[90px] flex justify-center items-center"
      />
    </div>
  );
};
