import React from 'react';
import { useData } from '../context/DataContext';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const { settings } = useData();
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-3xl mx-auto bg-[#151E2B] rounded-3xl border border-white/10 p-6 sm:p-10 space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
        {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      </h1>
      <p className="text-xs text-[#00B7FF]">
        Note: This template policy is editable from the Admin Dashboard and must be reviewed by
        legal counsel before public launch.
      </p>
      <div className="text-sm text-[#A5B1C2] leading-relaxed whitespace-pre-line">
        {isPrivacy ? settings.privacyPolicy : settings.termsOfService}
      </div>
    </div>
  );
};
