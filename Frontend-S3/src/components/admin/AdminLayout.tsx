import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/admin/organizations', label: 'Organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { path: '/admin/doctors', label: 'Doctors', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);
  const currentPath = window.location.pathname;

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    window.location.href = '/admin/login';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: sidebarOpen ? 256 : 80 }}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="bg-[#1a0b2e] text-white flex flex-col fixed h-full z-20 border-r border-purple-500/20"
      >
        <div className="p-4 flex items-center justify-between border-b border-purple-500/20">
          {sidebarOpen && <span className="text-xl font-bold text-purple-300">Admin Portal</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-purple-500/20 rounded-lg">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors ${currentPath === item.path || currentPath.startsWith(item.path + '/') ? 'bg-purple-500/30 border-r-4 border-purple-400' : ''}`}
            >
              <svg className="w-5 h-5 flex-shrink-0 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {sidebarOpen && <span className="text-purple-100">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-500/20">
          {sidebarOpen && userProfile && (
            <p className="text-sm text-purple-400 mb-2">{userProfile.email || 'Admin'}</p>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {children}
      </main>
    </div>
  );
};
