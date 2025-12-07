import React from 'react';
import { JobMethod } from '../types';
import { StrategyCard } from './StrategyCard';
import { BrainCircuit, Lightbulb, Target, ArrowRight } from 'lucide-react';

interface AnalysisViewProps {
  onSelectMethod: (methodId: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ onSelectMethod }) => {
  const methods: JobMethod[] = [
    {
      id: 'scraping',
      title: "1. Mass Web Scraping",
      description: "Création de bots (Python/Selenium) qui visitent chaque jour Indeed, Welcome to the Jungle, et les sites carrières pour extraire les données.",
      pros: ["Accès à 100% des données visibles", "Pas de coût API", "Contrôle total des sources"],
      cons: ["Maintenance infernale (DOM changeants)", "Bannissement IP fréquent", "Zone grise légale"],
      rating: 2,
    },
    {
      id: 'api_aggregation',
      title: "2. Official API Aggregation",
      description: "Connexion aux APIs officielles (France Travail, LinkedIn Partner, etc.) pour récupérer des flux structurés d'offres.",
      pros: ["Données propres et structurées", "Légal et stable", "Mises à jour temps réel"],
      cons: ["Accès très restreint/payant", "Processus d'approbation long", "Couverture limitée (beaucoup de sites n'ont pas d'API)"],
      rating: 3,
    },
    {
      id: 'ai_agent',
      title: "3. AI Search Agents",
      description: "Utilisation de LLMs (Gemini) connectés au Web (Grounding) pour comprendre ta recherche sémantique et parser les résultats en temps réel.",
      pros: ["Compréhension du contexte ('pas d'ESN', 'full remote')", "Zéro maintenance de scraper", "Massif (Index Google complet)"],
      cons: ["Coût par token (faible)", "Dépendance à la qualité de recherche Google"],
      rating: 5,
      recommended: true,
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <BrainCircuit className="text-indigo-500" size={40} />
          Analyse Stratégique
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Tu as demandé une approche "massive" pour trouver des alternances et stages en France. 
          Avant de coder l'outil final, voici l'analyse des trois vecteurs d'attaque possibles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {methods.map((method) => (
          <StrategyCard 
            key={method.id} 
            method={method} 
            onClick={() => method.recommended && onSelectMethod(method.id)} 
          />
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
             <Lightbulb className="text-yellow-500" size={24} />
             <h2 className="text-xl font-bold text-white">Ma Recommandation</h2>
          </div>
          <p className="text-slate-300 mb-4">
            La méthode <strong>AI Search Agents (Gemini + Grounding)</strong> est la gagnante incontestée aujourd'hui.
          </p>
          <p className="text-slate-300 mb-4">
            Pourquoi ? Contrairement au scraping qui casse quand un site change son CSS, l'IA "lit" le web comme un humain. 
            Elle peut filtrer "massivement" sur Google Search (qui indexe déjà tout) et te rendre un JSON propre.
          </p>
          <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
             <p className="text-indigo-300 text-sm font-mono">
               <strong>Prediction:</strong> Ta prochaine pensée sera sûrement : 
               "Ok pour l'IA, mais comment on automatise la candidature (envoi de CV adapté) une fois l'offre trouvée ?"
             </p>
          </div>
        </div>
        
        <div className="md:w-1/3 w-full bg-slate-800 rounded-lg p-6 border border-slate-700">
           <div className="flex items-center gap-2 mb-4 text-emerald-400">
             <Target size={20} />
             <span className="font-bold">Prochaine étape</span>
           </div>
           <p className="text-slate-400 text-sm mb-6">
             Nous allons créer un prototype utilisant la méthode recommandée pour prouver son efficacité sur la France.
           </p>
           <button 
             onClick={() => onSelectMethod('ai_agent')}
             className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2"
           >
             Lancer le Prototype
             <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};