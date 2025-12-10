import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe, Calendar, Clock, ArrowRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { PublishedLP } from '../types';
import { getStoredLPs, removeStoredLP } from '../services/storage';
import { deleteLandingPage } from '../services/api';

interface OverviewProps {
  onNavigateToPublish: () => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigateToPublish }) => {
  const [lps, setLps] = useState<PublishedLP[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLps(getStoredLPs());
  }, []);

  const handleDelete = async (subdomain: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${subdomain}? Isso removerá o site do ar.`)) {
      return;
    }

    setDeleting(subdomain);
    const result = await deleteLandingPage(subdomain);

    if (result.success) {
      removeStoredLP(subdomain);
      setLps(prev => prev.filter(lp => lp.subdomain !== subdomain));
    } else {
      alert(`Erro: ${result.message}`);
    }
    setDeleting(null);
  };

  const formatDate = (timestamp: number) => {
    // ... (rest of formatDate)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (lps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 tracking-tight pb-2">
            Visão Geral
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
            Você ainda não publicou nenhuma Landing Page.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Globe size={32} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Comece agora mesmo</h3>
          <p className="text-slate-500 mb-8 max-w-md">
            Faça o upload do seu primeiro arquivo .zip e coloque sua página no ar em segundos.
          </p>
          <button
            onClick={onNavigateToPublish}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Publicar minha primeira LP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 tracking-tight pb-2">
            Visão Geral
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Gerencie e monitore suas Landing Pages publicadas.
          </p>
        </div>
        <button
          onClick={onNavigateToPublish}
          className="px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Nova Publicação
        </button>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-indigo-50 bg-indigo-50/30">
                <th className="p-6 text-xs font-bold text-indigo-900 uppercase tracking-wider">Subdomínio</th>
                <th className="p-6 text-xs font-bold text-indigo-900 uppercase tracking-wider">URL</th>
                <th className="p-6 text-xs font-bold text-indigo-900 uppercase tracking-wider">Publicado em</th>
                <th className="p-6 text-xs font-bold text-indigo-900 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {lps.map((lp, index) => (
                <tr key={index} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                        <Globe size={20} />
                      </div>
                      <span className="font-bold text-slate-700">{lp.subdomain}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <a
                      href={lp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                    >
                      {lp.url.replace('https://', '')}
                    </a>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={16} />
                      <span>{formatDate(lp.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(lp.subdomain)}
                        disabled={deleting === lp.subdomain}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Excluir LP"
                      >
                        {deleting === lp.subdomain ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                      </button>
                      <a
                        href={lp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md transition-all"
                        title="Abrir LP"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-indigo-50">
          {lps.map((lp, index) => (
            <div key={index} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Globe size={20} />
                  </div>
                  <span className="font-bold text-slate-800 text-lg">{lp.subdomain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(lp.subdomain)}
                    disabled={deleting === lp.subdomain}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50"
                  >
                    {deleting === lp.subdomain ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  </button>
                  <a
                    href={lp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>

              <div className="space-y-2 pl-[52px]">
                <a href={lp.url} target="_blank" rel="noopener noreferrer" className="block text-indigo-600 font-medium break-all text-sm">
                  {lp.url}
                </a>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Clock size={14} />
                  {formatDate(lp.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;