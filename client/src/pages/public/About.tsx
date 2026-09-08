import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Briefcase, GraduationCap, Code2, Award, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Experience, Skill } from '../../types';
import { useProfile } from '../../context/ProfileContext';

export const About: React.FC = () => {
  const { profile } = useProfile();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/content/experiences'),
      api.get('/content/skills'),
    ])
      .then(([expRes, skillRes]) => {
        setExperiences(expRes.data || []);
        setSkills(skillRes.data || []);
      })
      .catch((err) => console.error('Failed to load about data:', err));
  }, []);

  const workExp = experiences.filter((e) => e.type === 'WORK');
  const eduExp = experiences.filter((e) => e.type === 'EDUCATION');

  // Group skills by category
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Intro Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">About Me</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Architecting high-scale software with <span className="text-gradient">precision</span> & craft.
          </h1>
          <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed max-w-3xl">
            {profile?.bio ||
              'Senior Full-Stack Architect with over 7 years of deep engineering experience. Specializing in high-throughput distributed systems, event-driven backends, and responsive, accessible user interfaces.'}
          </p>

          <div className="flex items-center gap-4 pt-4">
            {profile?.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume (PDF)</span>
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="p-3 rounded-3xl glass-panel border border-[#343636] bg-[#191a1a] shadow-2xl">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile?.name || 'Shahzod'}
                className="w-full aspect-[4/5] object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full aspect-[4/5] rounded-2xl bg-[#101111] border border-[#343636] flex flex-col items-center justify-center text-[#9d9f9e]">
                <div className="w-16 h-16 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#d6f779] shadow-inner mb-3">
                  <Terminal className="w-8 h-8" />
                </div>
                <span className="text-xs font-mono text-[#9d9f9e]">Engineer Profile</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SKILLS & PROFICIENCY */}
      <section className="space-y-10">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Competencies</span>
          <h2 className="text-3xl font-extrabold text-white">Technical Stack & Skills</h2>
          <p className="text-sm text-[#9d9f9e]">
            Engineered through hundreds of production deployments and continuous benchmark optimizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {categories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            return (
              <div key={cat} className="p-8 rounded-3xl glass-card border border-[#343636] bg-[#191a1a] space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#d6f779]" />
                  <span>{cat}</span>
                </h3>

                <div className="space-y-4">
                  {catSkills.map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-200 font-semibold">{skill.name}</span>
                        <span className="text-[#d6f779] font-bold">{skill.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#101111] overflow-hidden border border-[#343636]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-[#d6f779]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CAREER TIMELINE / WORK EXPERIENCE */}
      <section className="space-y-10">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Journey</span>
          <h2 className="text-3xl font-extrabold text-white">Professional Experience</h2>
        </div>

        <div className="relative border-l-2 border-[#343636] ml-4 pl-6 sm:pl-8 space-y-10">
          {workExp.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#d6f779] ring-4 ring-[#d6f779]/25 group-hover:scale-125 transition-transform" />

              <div className="p-6 rounded-2xl glass-card border border-[#343636] bg-[#191a1a] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{item.role}</h3>
                  <span className="text-xs font-mono text-[#d6f779] px-2.5 py-1 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/30 font-semibold">
                    {item.startDate} — {item.current ? 'Present' : item.endDate}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#9d9f9e]">{item.organization} • {item.location}</p>
                <p className="text-sm text-gray-300 leading-relaxed pt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      {eduExp.length > 0 && (
        <section className="space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Foundations</span>
            <h2 className="text-3xl font-extrabold text-white">Education & Academics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {eduExp.map((item) => (
              <div key={item.id} className="p-6 rounded-3xl glass-card border border-[#343636] bg-[#191a1a] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6f779]/15 border border-[#d6f779]/30 flex items-center justify-center text-[#d6f779]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.role}</h3>
                <p className="text-xs font-mono text-[#d6f779]">{item.organization} ({item.startDate} - {item.endDate})</p>
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
