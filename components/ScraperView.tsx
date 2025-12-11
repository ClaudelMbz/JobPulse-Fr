import React, { useState } from 'react';
import { Bot, Play, Server, Copy, Terminal, ShieldAlert, Code, Check, Globe, Activity, Zap, ArrowRight, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ScraperViewProps {
  onNavigateToSearch?: () => void;
}

export const ScraperView: React.FC<ScraperViewProps> = ({ onNavigateToSearch }) => {
  const [activeTab, setActiveTab] = useState<'interface' | 'code'>('interface');
  
  // URL DE TON BACKEND RENDER (Pré-configurée)
  const [backendUrl, setBackendUrl] = useState('https://jobpulse-helper.onrender.com');
  const [url, setUrl] = useState('https://fr.indeed.com/viewjob?jk=example');
  
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Status du serveur
  const [serverStatus, setServerStatus] = useState<'unknown' | 'checking' | 'online' | 'offline'>('unknown');

  const handlePing = async () => {
    setServerStatus('checking');
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout pour le réveil

        const res = await fetch(`${backendUrl}/ping`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            setServerStatus('online');
        } else {
            setServerStatus('offline');
        }
    } catch (e) {
        console.error(e);
        setServerStatus('offline');
    }
  };

  // --- LOGIQUE DE SCRAPING RÉELLE ---
  const handleScrape = async () => {
    setLoading(true);
    setError('');
    setExtractedText('');

    try {
      console.log(`🚀 Appel vers le backend : ${backendUrl}/api/scrape`);
      
      const response = await fetch(`${backendUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur serveur: ${response.status}`);
      }

      setExtractedText(data.extracted_text);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de connexion au serveur.");
      setServerStatus('offline');
      
      // Message d'aide spécifique pour Render Free Tier
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
         setExtractedText("⚠️ IMPOSSIBLE DE JOINDRE LE SERVEUR.\n\nDiagnostic possible :\n1. Le serveur Render est en train de se réveiller (cela prend environ 50 secondes pour le premier appel).\n2. L'URL du backend est incorrecte.\n3. CORS bloque la requête (vérifie que flask_cors est bien actif sur le python).");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransferToAI = () => {
    if (!extractedText) return;
    
    // On sauvegarde le texte dans le stockage de session pour le récupérer dans l'autre vue
    sessionStorage.setItem('jobpulse_temp_job_description', extractedText);
    
    // On redirige
    if (onNavigateToSearch) {
      onNavigateToSearch();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Code Python pour référence
  const pythonCode = `import threading
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import os

app = Flask(__name__)
CORS(app)  # Autorise ton frontend à appeler cette API

# --- CONFIGURATION RENDER ---
# Remplace par l'URL fournie par Render après déploiement
RENDER_EXTERNAL_URL = "https://jobpulse-helper.onrender.com"

def keep_alive():
    while True:
        time.sleep(420)  # 7 minutes
        try:
            requests.get(f"{RENDER_EXTERNAL_URL}/ping")
        except Exception as e:
            print(f"❌ Erreur Ping: {e}")

threading.Thread(target=keep_alive, daemon=True).start()

@app.route('/ping', methods=['GET'])
def ping():
    return "Pong! Je suis réveillé.", 200

@app.route('/api/scrape', methods=['POST'])
def scrape_job():
    data = request.json
    url_to_scrape = data.get('url')
    # ... logique scraping ...
    return jsonify({"status": "success", "extracted_text": "..."})
`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="text-pink-500" size={32} />
            Scraper Live
          </h1>
          <p className="text-slate-400 mt-2">
            Connexion au backend Python hébergé sur Render.
          </p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('interface')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'interface' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <Zap size={16} /> Interface Live
            </button>
            <button 
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <Code size={16} /> Code Source
            </button>
        </div>
      </div>

      {activeTab === 'interface' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-left-4">
             {/* Configuration Column */}
             <div className="space-y-6">
                
                {/* Status Backend */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
                        <Server size={14} /> URL du Serveur Backend
                    </label>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="text" 
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-emerald-400 text-xs font-mono outline-none"
                        />
                        
                        <div className="flex items-center justify-between bg-slate-900 rounded-lg p-2 border border-slate-700">
                             <div className="flex items-center gap-2">
                                {serverStatus === 'checking' && <Loader2 size={16} className="animate-spin text-yellow-500"/>}
                                {serverStatus === 'online' && <Wifi size={16} className="text-emerald-500"/>}
                                {serverStatus === 'offline' && <WifiOff size={16} className="text-red-500"/>}
                                {serverStatus === 'unknown' && <Activity size={16} className="text-slate-500"/>}
                                
                                <span className={`text-xs font-bold ${
                                    serverStatus === 'online' ? 'text-emerald-400' : 
                                    serverStatus === 'offline' ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                    {serverStatus === 'online' ? 'Serveur en ligne (Prêt)' : 
                                     serverStatus === 'offline' ? 'Serveur injoignable' : 
                                     serverStatus === 'checking' ? 'Vérification...' : 'Statut inconnu'}
                                </span>
                             </div>

                             <button 
                                onClick={handlePing}
                                disabled={serverStatus === 'checking'}
                                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors"
                             >
                                {serverStatus === 'offline' ? 'Réveiller / Ping' : 'Tester'}
                             </button>
                        </div>
                    </div>
                </div>

                {/* Input URL */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                    <label className="block text-sm font-bold text-white mb-2">
                       URL de l'offre à extraire
                    </label>
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://fr.indeed.com/..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white text-sm focus:ring-2 focus:ring-pink-500 outline-none mb-4"
                    />
                    
                    <button 
                        onClick={handleScrape}
                        disabled={loading}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Globe size={20} />}
                        {loading ? 'Communication serveur...' : 'Lancer le Scraping'}
                    </button>

                    {loading && (
                        <p className="text-xs text-center text-slate-500 mt-3 animate-pulse">
                            Si le serveur dormait, cela peut prendre jusqu'à 50 secondes...
                        </p>
                    )}
                </div>

                {/* Info Box */}
                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl text-sm text-indigo-200">
                    <h4 className="font-bold mb-1 flex items-center gap-2"><Bot size={16}/> Comment ça marche ?</h4>
                    <p className="text-xs opacity-80 leading-relaxed">
                        1. React envoie l'URL à ton serveur Render.<br/>
                        2. Ton Python (requests) va chercher la page Indeed.<br/>
                        3. Ton Python renvoie le texte nettoyé ici.
                    </p>
                </div>
             </div>

             {/* Result Column */}
             <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[500px]">
                 <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                     <span className="text-slate-400 text-xs font-mono flex items-center gap-2">
                         <Terminal size={14} /> Sortie JSON / Texte
                     </span>
                     <div className="flex gap-2">
                        {extractedText && (
                            <button onClick={() => handleCopy(extractedText)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-white px-2 py-1 rounded border border-transparent hover:border-slate-700 transition-colors">
                                <Copy size={12} /> Copier
                            </button>
                        )}
                     </div>
                 </div>

                 {error ? (
                     <div className="flex-1 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm overflow-auto">
                        <strong className="flex items-center gap-2 mb-2"><ShieldAlert size={16}/> Erreur :</strong>
                        <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
                     </div>
                 ) : extractedText ? (
                     <div className="flex-1 flex flex-col h-full">
                         <textarea 
                            readOnly 
                            value={extractedText}
                            className="flex-1 w-full bg-transparent text-slate-300 font-mono text-xs resize-none outline-none custom-scrollbar mb-4"
                         />
                         
                         {/* BOUTON MAGIQUE DE TRANSFERT */}
                         <button 
                            onClick={handleTransferToAI}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 fade-in"
                         >
                            <Zap size={18} fill="currentColor" />
                            Transférer vers l'IA & Générer la Candidature
                            <ArrowRight size={18} />
                         </button>
                     </div>
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-4">
                         <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                             <Server size={32} className="opacity-50"/>
                         </div>
                         <p className="text-sm">En attente de données du backend...</p>
                     </div>
                 )}
             </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4">Code Python Déployé</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Ce code tourne actuellement sur ton instance Render. Il sert de pont (Proxy) pour contourner les sécurités CORS du navigateur.
                    </p>
                    <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
                        Status: <strong>Actif</strong><br/>
                        URL: <span className="font-mono">{backendUrl}</span>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-3 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">server.py</span>
                    <button 
                        onClick={() => handleCopy(pythonCode)} 
                        className="flex items-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copié' : 'Copier'}
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    <pre className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {pythonCode}
                    </pre>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};