import React from 'react';
import { Calendar, Clock, Video, Globe2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CalEmbed } from '../../components/public/CalEmbed';

export const BookMeetingPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top breadcrumb */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#9d9f9e] hover:text-[#d6f779] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>DIRECT DISCOVERY CALL</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Schedule a 30-Minute Call
        </h1>
        <p className="text-sm sm:text-base text-[#9d9f9e] leading-relaxed">
          Select an available slot on the calendar below. We’ll connect via Google Meet to discuss architecture, contract development, or your project scope.
        </p>

        {/* Perks pill bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-300 font-mono pt-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#191a1a] border border-[#343636]">
            <Clock className="w-3.5 h-3.5 text-[#d6f779]" />
            30 Minutes
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#191a1a] border border-[#343636]">
            <Video className="w-3.5 h-3.5 text-[#d6f779]" />
            Google Meet (Auto-generated)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#191a1a] border border-[#343636]">
            <Globe2 className="w-3.5 h-3.5 text-[#d6f779]" />
            Auto Timezone Conversion
          </span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="rounded-3xl glass-panel border border-[#343636] p-3 sm:p-6 bg-[#191a1a] shadow-2xl">
        <CalEmbed height="680px" />
      </div>
    </div>
  );
};
