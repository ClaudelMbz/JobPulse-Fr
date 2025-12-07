import React, { useState } from 'react';
import { searchJobsWithGemini } from '../services/geminiService';
import { JobSearchResult } from '../types';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Sparkles, Filter, BrainCircuit } from 'lucide-react';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('Développeur React Alternance');
  const [location, setLocation] = useState('Paris');
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setResults([]);
    setAnalysis('');

    try {
      const { text, links } = await searchJobsWithGemini(query, location);
      setAnalysis(text);
      setResults(links);
    } catch (error) {
      console.error(error);
      setAnalysis("Une erreur est survenue lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Sparkles className="text-indigo-400" />
            Agent de Recherche IA
         </h2>
         <p className="text-slate-400">
           Utilise Gemini Search Grounding pour scanner le web français en temps réel.
         </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 mb-8 sticky top-4 z-10 shadow-xl">
        <div className="flex-1 relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Poste (ex: Alternance Data Analyst)"
            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="relative md:w-1/4">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lieu (ex: Lyon)"
            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          {loading ? 'Analyse...' : 'Scanner'}
        </button>
      </form>

      {/* Results Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: AI Summary */}
        <div className="lg:col-span-2 space-y-6">
          {searched && !loading && results.length === 0 && (
             <div className="text-center py-12 text-slate-500">
               Aucun résultat trouvé via l'IA pour cette recherche spécifique.
             </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-slate-300 font-semibold flex items-center gap-2">
                <Filter size={16} /> Résultats Identifiés ({results.length})
              </h3>
              {results.map((job, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-indigo-500 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 mb-1">{job.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-slate-500 text-xs">Via {job.source}</span>
                      </div>
                    </div>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-700 hover:bg-indigo-600 rounded-full text-slate-300 hover:text-white transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {job.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Strategic Context (The "Analysis") */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-28">
            <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
              <BrainCircuit size={18} />
              Contexte Stratégique
            </h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
              </div>
            ) : analysis ? (
              <div className="prose prose-invert prose-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Basic rendering of markdown-like text from Gemini */}
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">
                Lances une recherche pour obtenir une analyse du marché actuel pour ce poste. L'IA t'indiquera les tendances détectées dans les résultats.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};