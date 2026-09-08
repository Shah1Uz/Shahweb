import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, CloudLightning, Settings, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Service } from '../../types';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/content/services')
      .then((res) => setServices(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Engineering Capabilities</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Specialized Engineering Services
        </h1>
        <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed">
          High-performance distributed systems, modern React frontends, cloud automation, and custom CMS architecture.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-mono text-[#9d9f9e]">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            let features: string[] = [];
            try {
              features = JSON.parse(service.features);
            } catch {}

            return (
              <div
                key={service.id}
                className="p-8 rounded-3xl glass-card flex flex-col justify-between border border-[#343636] hover:border-[#d6f779]/45 transition-all duration-300 group bg-[#191a1a]"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#d6f779]/15 border border-[#d6f779]/30 flex items-center justify-center text-[#d6f779] group-hover:scale-110 transition-transform">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#d6f779] transition-colors">{service.title}</h3>
                  <p className="text-sm text-[#9d9f9e] leading-relaxed">{service.description}</p>
                </div>

                <div className="pt-6 mt-8 border-t border-[#343636] space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#9d9f9e]">Core Deliverables</h4>
                  <div className="space-y-2">
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#d6f779] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#101111] hover:bg-[#d6f779]/15 text-white hover:text-[#d6f779] border border-[#343636] hover:border-[#d6f779]/35 text-xs font-semibold transition-all"
                    >
                      <span>Inquire About This Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
