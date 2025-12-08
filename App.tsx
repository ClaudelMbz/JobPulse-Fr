
import React, { useState } from 'react';
import { AppView } from './types';
import { AnalysisView } from './components/AnalysisView';
import { SearchView } from './components/SearchView';
import { ProfileView } from './components/ProfileView';
import { Briefcase, LayoutDashboard, Menu, User } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.STRATEGY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      {/* Sidebar - Mobile Responsive */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-500 font-bold text-xl mb-10">
            <Briefcase size={28} />
            <span>JobPulse FR</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => { setCurrentView(AppView.STRATEGY); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.STRATEGY 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              Stratégie
            </button>
            <button 
              onClick={() => { setCurrentView(AppView.PROFILE); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.PROFILE 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <User size={20} />
              Mon Profil
            </button>
            <button 
              onClick={() => { setCurrentView(AppView.SEARCH); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.SEARCH 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Briefcase size={20} />
              Recherche Active (IA)
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
           <div className="text-xs text-slate-500 text-center">
             Propulsé par Gemini 2.5<br/>& Google Search Grounding
           </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex justify-between items-center bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
           <span className="font-bold text-indigo-500">JobPulse FR</span>
           <button onClick={toggleSidebar} className="text-white">
             <Menu size={24} />
           </button>
        </div>

        {currentView === AppView.STRATEGY && (
          <AnalysisView onSelectMethod={(id) => {
             if (id === 'ai_agent') setCurrentView(AppView.PROFILE); 
             else setCurrentView(AppView.SEARCH);
          }} />
        )}

        {currentView === AppView.PROFILE && (
          <ProfileView onNavigateToSearch={() => setCurrentView(AppView.SEARCH)} />
        )}
        
        {currentView === AppView.SEARCH && (
          <SearchView />
        )}
      </main>
    </div>
  );
};

export default App;
