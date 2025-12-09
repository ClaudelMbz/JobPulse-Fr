
import React, { useState } from 'react';
import { searchJobsWithGemini, generateApplicationPackage } from '../services/geminiService';
import { JobSearchResult, MasterProfile, ApplicationPackage } from '../types';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Sparkles, Filter, BrainCircuit, X, CheckCircle2, ArrowRight, FileText, AlertTriangle, ChevronLeft, UserCheck, Download, Zap, ClipboardPaste } from 'lucide-react';
import { downloadCvPdf, downloadLetterPdf } from '../utils/pdfGenerator';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('Développeur React Alternance');
  const [location, setLocation] = useState('Paris');
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // State for Modal & Generation
  const [selectedJob, setSelectedJob] = useState<JobSearchResult | null>(null);
  const [fullDescription, setFullDescription] = useState(''); // New State for Precision Mode
  const [showPrecisionMode, setShowPrecisionMode] = useState(false); // Toggle UI
  
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [generatedPackage, setGeneratedPackage] = useState<ApplicationPackage | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Preview Mode State
  const [previewMode, setPreviewMode] = useState<'cv' | 'letter' | null>(null);
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [downloadingLetter, setDownloadingLetter] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setResults([]);
    setAnalysis('');
    setSelectedJob(null);

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

  const handleJobClick = (job: JobSearchResult) => {
    setSelectedJob(job);
    setGenerationStatus('idle');
    setGeneratedPackage(null);
    setErrorMessage('');
    setPreviewMode(null);
    setFullDescription(''); // Reset precision input
    setShowPrecisionMode(false);
  };

  const handleGenerateValues = async () => {
    const savedProfile = localStorage.getItem('jobpulse_master_profile');
    if (!savedProfile) {
      setErrorMessage("Aucun profil trouvé ! Remplissez d'abord votre Master Profil.");
      setGenerationStatus('error');
      return;
    }

    const profile: MasterProfile = JSON.parse(savedProfile);
    if (!selectedJob) return;

    setGenerationStatus('analyzing');
    setErrorMessage('');

    try {
      // Pass fullDescription if available
      const result = await generateApplicationPackage(profile, selectedJob, fullDescription);
      setGeneratedPackage(result);
      setGenerationStatus('ready');
    } catch (error) {
      console.error(error);
      setErrorMessage("Erreur lors de la génération. Veuillez réessayer.");
      setGenerationStatus('error');
    }
  };

  const handleDownloadCv = () => {
    if (!generatedPackage || !selectedJob) return;
    setDownloadingCv(true);
    try {
      downloadCvPdf(generatedPackage.optimizedProfile, selectedJob.title);
    } catch(e) {
      console.error(e);
      alert("Erreur lors de la création du PDF CV");
    } finally {
      setDownloadingCv(false);
    }
  };

  const handleDownloadLetter = () => {
    if (!generatedPackage || !selectedJob) return;
    setDownloadingLetter(true);
    try {
      downloadLetterPdf(
        generatedPackage.optimizedProfile, 
        selectedJob.company, 
        selectedJob.title, 
        generatedPackage.coverLetter
      );
    } catch(e) {
      console.error(e);
      alert("Erreur lors de la création du PDF Lettre");
    } finally {
      setDownloadingLetter(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col relative">
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
                <div 
                  key={idx} 
                  onClick={() => handleJobClick(job)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                    <ArrowRight size={20} />
                  </div>
                  <div className="flex justify-between items-start pr-8">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 mb-1">{job.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {job.snippet}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                     <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700">Source: {job.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Strategic Context */}
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

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 flex justify-between items-start z-10 shrink-0">
              <div className="flex items-center gap-4">
                {previewMode && (
                   <button 
                     onClick={() => setPreviewMode(null)}
                     className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                   >
                     <ChevronLeft size={24} />
                   </button>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {previewMode === 'letter' ? 'Lettre de Motivation' : 
                     previewMode === 'cv' ? 'CV Optimisé (Aperçu)' : 
                     selectedJob.title}
                  </h3>
                  {!previewMode && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/20">
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> {selectedJob.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* --- VIEW: MAIN DETAILS --- */}
              {!previewMode && (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Extrait de l'offre</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedJob.snippet}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <a 
                        href={selectedJob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Voir l'offre originale sur {selectedJob.source} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  {/* PRECISION MODE SECTION */}
                  <div className="bg-slate-800 rounded-xl p-1 border border-slate-700">
                     <button 
                       onClick={() => setShowPrecisionMode(!showPrecisionMode)}
                       className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-750 rounded-lg transition-colors group"
                     >
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${showPrecisionMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'} transition-colors`}>
                              <Zap size={18} />
                           </div>
                           <div>
                              <h4 className="text-white font-bold text-sm">Mode Précision (Recommandé)</h4>
                              <p className="text-xs text-slate-400">Collez la description complète pour une candidature parfaite.</p>
                           </div>
                        </div>
                        <div className={`transform transition-transform ${showPrecisionMode ? 'rotate-90' : ''} text-slate-500`}>
                           <ChevronLeft size={18} />
                        </div>
                     </button>
                     
                     {showPrecisionMode && (
                        <div className="p-4 pt-0 animate-in slide-in-from-top-2 fade-in">
                           <div className="relative">
                              <textarea
                                value={fullDescription}
                                onChange={(e) => setFullDescription(e.target.value)}
                                placeholder="Allez sur le lien de l'offre, copiez tout le texte, et collez-le ici..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white h-32 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                              />
                              <div className="absolute bottom-3 right-3 pointer-events-none">
                                 <ClipboardPaste className="text-slate-700" size={16} />
                              </div>
                           </div>
                        </div>
                     )}
                  </div>


                  {/* ACTION AREA */}
                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className={generationStatus === 'analyzing' ? 'text-indigo-400 animate-spin-slow' : 'text-indigo-400'} size={24} />
                        <h4 className="text-lg font-bold text-white">Assistant de Candidature (IA)</h4>
                      </div>

                      {generationStatus === 'error' && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 text-red-200">
                          <AlertTriangle size={20} />
                          <p>{errorMessage}</p>
                        </div>
                      )}
                      
                      {generationStatus === 'idle' || generationStatus === 'error' ? (
                        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
                          <p className="text-indigo-200 mb-6">
                            L'IA va croiser ton <strong>Master Profil</strong> avec {fullDescription ? 'la description complète fournie' : 'le résumé ci-dessus'} pour générer une stratégie sur-mesure.
                          </p>
                          <button 
                            onClick={handleGenerateValues}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                          >
                            <FileText size={20} />
                            Générer ma Candidature {fullDescription ? '(Précision Max)' : '(Standard)'}
                          </button>
                        </div>
                      ) : null}

                      {generationStatus === 'analyzing' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                          <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
                          <h5 className="text-xl font-bold text-white mb-2">Analyse IA en cours...</h5>
                          <p className="text-slate-400">
                            1. Analyse {fullDescription ? 'approfondie' : 'standard'} du besoin...<br/>
                            2. Réécriture du CV...<br/>
                            3. Rédaction de la lettre...
                          </p>
                        </div>
                      )}

                      {generationStatus === 'ready' && generatedPackage && (
                        <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex items-center gap-4 mb-6">
                             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                                <CheckCircle2 size={24} />
                             </div>
                             <div>
                                <h5 className="text-xl font-bold text-white">Candidature Prête !</h5>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                   <span>Match Score:</span>
                                   <span className="font-bold text-emerald-400">{generatedPackage.matchScore}%</span>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                               <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Stratégie IA</span>
                               <p className="text-slate-300 text-sm">{generatedPackage.analysis}</p>
                            </div>
                            {generatedPackage.missingSkills.length > 0 && (
                              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">Compétences Manquantes (Gap)</span>
                                <p className="text-slate-400 text-sm">{generatedPackage.missingSkills.join(', ')}</p>
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTONS: PREVIEW & DOWNLOAD */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                             {/* Preview Buttons */}
                             <button 
                               onClick={() => setPreviewMode('cv')}
                               className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2"
                             >
                               <UserCheck size={16} /> Voir Aperçu CV
                             </button>
                             <button 
                               onClick={() => setPreviewMode('letter')}
                               className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2"
                             >
                               <FileText size={16} /> Voir Aperçu Lettre
                             </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
                             {/* Download Buttons (PDF - Using jsPDF manually) */}
                             <button 
                               onClick={handleDownloadCv}
                               disabled={downloadingCv}
                               className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                               {downloadingCv ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                               {downloadingCv ? 'Création PDF...' : 'Télécharger CV'}
                             </button>

                             <button 
                               onClick={handleDownloadLetter}
                               disabled={downloadingLetter}
                               className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                               {downloadingLetter ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                               {downloadingLetter ? 'Création PDF...' : 'Télécharger Lettre'}
                             </button>
                          </div>
                          
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- VIEW: PREVIEW LETTER --- */}
              {previewMode === 'letter' && generatedPackage && (
                <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
                  <div className="bg-slate-100 text-slate-900 p-8 rounded-lg font-serif shadow-xl">
                    <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {generatedPackage.coverLetter}
                    </div>
                  </div>
                </div>
              )}

              {/* --- VIEW: PREVIEW CV --- */}
              {previewMode === 'cv' && generatedPackage && (
                <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                   {/* Compare Bio */}
                   <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                      <h4 className="text-indigo-400 font-bold mb-3">Résumé Professionnel (Réécrit)</h4>
                      <p className="text-slate-300 text-sm italic border-l-4 border-indigo-500 pl-4 py-1 bg-slate-900/50">
                        {generatedPackage.optimizedProfile.bio}
                      </p>
                   </div>

                   {/* Skills */}
                   <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                      <h4 className="text-emerald-400 font-bold mb-3">Compétences Mises en Avant</h4>
                      <div className="flex flex-wrap gap-2">
                         {/* Safe split logic for mixed types */}
                         {String(generatedPackage.optimizedProfile.skills || '').split(',').map((skill, i) => (
                           <span key={i} className="px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600">
                             {skill.trim()}
                           </span>
                         ))}
                      </div>
                   </div>

                   {/* Experiences */}
                   <div>
                      <h4 className="text-white font-bold mb-3">Expériences Reformulées</h4>
                      <div className="space-y-4">
                        {generatedPackage.optimizedProfile.experiences.map((exp, i) => (
                          <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                             <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-white">{exp.role}</h5>
                                <span className="text-xs text-slate-500">{exp.startDate}</span>
                             </div>
                             <div className="text-indigo-400 text-sm mb-2">{exp.company}</div>
                             <p className="text-slate-400 text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
