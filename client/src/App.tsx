import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/public/PublicLayout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Projects } from './pages/public/Projects';
import { ProjectDetail } from './pages/public/ProjectDetail';
import { News } from './pages/public/News';
import { NewsDetail } from './pages/public/NewsDetail';
import { Blog } from './pages/public/Blog';
import { BlogDetail } from './pages/public/BlogDetail';
import { Services } from './pages/public/Services';
import { Contact } from './pages/public/Contact';
import { BookMeetingPage } from './pages/public/BookMeetingPage';

// Admin
import { Login } from './pages/admin/Login';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProfileAdmin } from './pages/admin/ProfileAdmin';
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin';
import { NewsAdmin } from './pages/admin/NewsAdmin';
import { BlogAdmin } from './pages/admin/BlogAdmin';
import { MediaAdmin } from './pages/admin/MediaAdmin';
import { AudioAdmin } from './pages/admin/AudioAdmin';
import { SkillsAdmin } from './pages/admin/SkillsAdmin';
import { ExperienceAdmin } from './pages/admin/ExperienceAdmin';
import { ServicesAdmin } from './pages/admin/ServicesAdmin';
import { TestimonialsAdmin } from './pages/admin/TestimonialsAdmin';
import { MessagesAdmin } from './pages/admin/MessagesAdmin';
import { NavigationAdmin } from './pages/admin/NavigationAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<BookMeetingPage />} />
          <Route path="/meeting" element={<BookMeetingPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="news" element={<NewsAdmin />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="media" element={<MediaAdmin />} />
          <Route path="audio" element={<AudioAdmin />} />
          <Route path="skills" element={<SkillsAdmin />} />
          <Route path="experience" element={<ExperienceAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="navigation" element={<NavigationAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h1 className="text-6xl font-extrabold font-mono text-white">404</h1>
              <h2 className="text-2xl font-bold">Route Out of Bounds</h2>
              <p className="text-sm text-gray-400 max-w-md">
                The requested URL does not match any route in the distributed network.
              </p>
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono"
              >
                Return to Base
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
