import React from 'react';
import { Link } from 'react-router-dom';
import { HERO_IMAGE } from '../data/seedData';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-3xl overflow-hidden border border-white/10 aspect-[16/9] bg-[#101722]">
        <img
          src={HERO_IMAGE}
          alt="KhelaDekH Stadium"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="bg-[#151E2B] rounded-3xl border border-white/10 p-6 sm:p-10 space-y-4">
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
          About KhelaDekH
        </h1>
        <p className="text-sm sm:text-base text-[#A5B1C2] leading-relaxed">
          KhelaDekH is a modern sports and entertainment platform built for fans who want fast,
          reliable access to live match statuses, upcoming fixture schedules, editorial coverage,
          and authorized broadcast links.
        </p>
        <p className="text-sm sm:text-base text-[#A5B1C2] leading-relaxed">
          We partner with official rights holders and leagues to surface verified viewing options
          across football, cricket, basketball, tennis, and more—designed mobile-first for
          effortless browsing on any screen.
        </p>
        <div className="pt-4">
          <Link
            to="/contact"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors inline-flex items-center"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </div>
  );
};
