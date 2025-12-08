import React from 'react';
import { LayoutDashboard, Rocket, FileCode2, LogOut } from 'lucide-react';
import { ViewState } from '../types';
import { getUserEmail } from '../services/auth';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  
  const getButtonClass = (isActive: boolean) => {
    return isActive 
      ? "w-full flex items-center gap-3 px-4 py-3 text-indigo-600 bg-indigo-50 rounded-xl transition-all duration-200 shadow-sm ring-1 ring-indigo-100 font-bold"
      : "w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group font-medium";
  };

  const getIconClass = (isActive: boolean) => {
    return isActive 
      ? "text-indigo-600"
      : "group-hover:scale-110 transition-transform";
  };

  return (
    <aside className="w-full md:w-64 bg-white/80 backdrop-blur-md md:h-screen md:fixed left-0 top-0 border-r border-indigo-100 flex flex-col z-10">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-indigo-50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
          <FileCode2 size={20} />
        </div>
        <span className="font-bold text-lg text-slate-800 tracking-tight">Prospera Pages</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button 
          onClick={() => onNavigate('overview')}
          className={getButtonClass(currentView === 'overview')}
        >
          <LayoutDashboard size={20} className={getIconClass(currentView === 'overview')} />
          <span>Visão Geral</span>
        </button>

        <button 
          onClick={() => onNavigate('publish')}
          className={getButtonClass(currentView === 'publish')}
        >
          <Rocket size={20} className={getIconClass(currentView === 'publish')} />
          <span>Publicar Landing Page</span>
        </button>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-indigo-50 space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
          <p className="text-xs font-semibold text-indigo-900 uppercase mb-1">Usuário</p>
          <p className="text-xs text-slate-600 truncate font-medium">{getUserEmail()}</p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;