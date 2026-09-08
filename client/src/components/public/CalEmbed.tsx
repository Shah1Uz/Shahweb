import React, { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Loader2 } from 'lucide-react';

interface CalEmbedProps {
  calLink?: string;
  className?: string;
  height?: string;
}

export const CalEmbed: React.FC<CalEmbedProps> = ({
  calLink = 'shahzod-roziqulov-nvrnt5/30min',
  className = '',
  height = '650px',
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({ namespace: '30min' });
        cal('ui', {
          theme: 'dark',
          styles: {
            branding: { brandColor: '#d6f779' },
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
        setLoaded(true);
      } catch (err) {
        console.warn('Cal API initialization warning:', err);
        setLoaded(true);
      }
    })();
  }, []);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#141515] border border-[#343636] ${className}`} style={{ minHeight: height }}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#141515] z-10 text-[#9d9f9e]">
          <Loader2 className="w-8 h-8 text-[#d6f779] animate-spin" />
          <span className="text-xs font-mono">Loading calendar slots...</span>
        </div>
      )}
      <Cal
        namespace="30min"
        calLink={calLink}
        style={{ width: '100%', height: '100%', minHeight: height, overflow: 'auto' }}
        config={{ layout: 'month_view', theme: 'dark' }}
      />
    </div>
  );
};
