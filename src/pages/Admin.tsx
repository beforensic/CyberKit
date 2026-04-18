import { useState } from 'react';
import { LayoutDashboard, BookOpen, Settings, ChevronLeft, LogOut } from 'lucide-react';

export default function Admin({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [tab, setTab] = useState('ressources');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <div className="text-2xl font-black mb-10 text-orange-500">CyberKit Admin</div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setTab('ressources')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${tab === 'ressources' ? 'bg-orange-500' : 'hover:bg-slate-800'}`}>
            <BookOpen size={20} /> Ressources
          </button>
          <button onClick={() => setTab('questions')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${tab === 'questions' ? 'bg-orange-500' : 'hover:bg-slate-800'}`}>
            <Settings size={20} /> Questions
          </button>
        </nav>
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-slate-400 hover:text-white mt-auto">
          <ChevronLeft size={20} /> Retour site
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-12 overflow-auto text-left">
        <h1 className="text-4xl font-black mb-8 capitalize">{tab}</h1>
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] h-96 flex items-center justify-center text-slate-400 font-medium">
          L'interface de gestion des {tab} est active.
          {/* Ici tu peux ré-insérer tes composants ResourceList ou QuestionList */}
        </div>
      </div>
    </div>
  );
}