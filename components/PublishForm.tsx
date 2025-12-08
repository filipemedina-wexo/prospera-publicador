import React, { useState, ChangeEvent } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { PublishStatus, PublishResponse } from '../types';
import { publishLandingPage } from '../services/api';
import { addStoredLP } from '../services/storage';

const PublishForm: React.FC = () => {
  const [subdomain, setSubdomain] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PublishStatus>(PublishStatus.IDLE);
  const [result, setResult] = useState<PublishResponse | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset status if user changes file after an error
      if (status === PublishStatus.ERROR) setStatus(PublishStatus.IDLE);
    }
  };

  const handleSubdomainChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Basic sanitization for subdomain (lowercase, no spaces)
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(val);
    if (status === PublishStatus.ERROR) setStatus(PublishStatus.IDLE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || !file) return;

    setStatus(PublishStatus.UPLOADING);
    setResult(null);

    const response = await publishLandingPage(subdomain, file);

    if (response.success && response.url) {
      addStoredLP({
        subdomain: subdomain,
        url: response.url,
        createdAt: Date.now()
      });
    }

    setResult(response);
    setStatus(response.success ? PublishStatus.SUCCESS : PublishStatus.ERROR);
  };

  const isButtonDisabled = !subdomain || !file || status === PublishStatus.UPLOADING;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      
      {/* Header Section */}
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 tracking-tight pb-2">
          O que vamos publicar hoje?
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
          Envie um arquivo ZIP e escolha o subdomínio para colocar sua landing page no ar em segundos.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white overflow-hidden relative group">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

        <div className="p-8 md:p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Subdomain Input */}
            <div className="space-y-2">
              <label htmlFor="subdomain" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Subdomínio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Globe size={20} />
                </div>
                <input
                  id="subdomain"
                  type="text"
                  value={subdomain}
                  onChange={handleSubdomainChange}
                  placeholder="ex.: padariajoao"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium text-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                   <span className="text-sm text-slate-400 font-semibold bg-slate-100 px-2 py-1 rounded-md">.prosperapages.com.br</span>
                </div>
              </div>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label htmlFor="file" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Arquivo ZIP da Landing Page
              </label>
              <div className="relative group/upload">
                <input
                  id="file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-xl file:border-0
                    file:text-sm file:font-bold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    file:cursor-pointer cursor-pointer
                    border border-slate-200 rounded-xl
                    bg-white p-2
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 pl-1">Apenas arquivos .zip são permitidos.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-5 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all duration-300 transform
                ${isButtonDisabled 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-purple-300 hover:-translate-y-1 active:scale-[0.98]'
                } flex items-center justify-center gap-3`}
            >
              {status === PublishStatus.UPLOADING ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={24} />
                  <span>Publicar LP</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Section */}
      {status === PublishStatus.SUCCESS && result && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-green-100 border border-green-100 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold text-slate-800">LP publicada com sucesso!</h3>
            <p className="text-slate-500">Sua landing page já está acessível globalmente.</p>
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-2 text-indigo-600 font-bold hover:text-indigo-800 hover:underline break-all"
            >
              {result.url}
            </a>
          </div>
        </div>
      )}

      {status === PublishStatus.ERROR && result && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-red-100 border border-red-100 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Ops! Algo deu errado.</h3>
            <p className="text-red-500 font-medium">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishForm;