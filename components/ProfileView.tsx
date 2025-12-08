
import React, { useState, useEffect, useRef } from 'react';
import { MasterProfile, Experience, Project, Education } from '../types';
import { Save, User, Briefcase, Code, GraduationCap, Plus, Trash2, AlertCircle, CheckCircle2, Download, Upload, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

const EMPTY_PROFILE: MasterProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  bio: '',
  skills: '',
  experiences: [],
  projects: [],
  education: []
};

// We add a prop to allow navigation change from here
interface ProfileViewProps {
  onNavigateToSearch?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSearch }) => {
  const [profile, setProfile] = useState<MasterProfile>(EMPTY_PROFILE);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jobpulse_master_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const handleSave = () => {
    setStatus('saving');
    localStorage.setItem('jobpulse_master_profile', JSON.stringify(profile));
    setTimeout(() => setStatus('saved'), 500);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mon_profil_jobpulse.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedProfile = JSON.parse(content);
        if (parsedProfile && typeof parsedProfile === 'object') {
          setProfile(prev => ({ ...EMPTY_PROFILE, ...parsedProfile }));
          localStorage.setItem('jobpulse_master_profile', JSON.stringify(parsedProfile));
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 3000);
        } else {
          alert("Le fichier JSON semble invalide.");
        }
      } catch (error) {
        console.error("Error parsing JSON", error);
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const updateField = (field: keyof MasterProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (key: 'experiences' | 'projects' | 'education', emptyItem: any) => {
    setProfile(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), { ...emptyItem, id: crypto.randomUUID() }]
    }));
  };

  const removeItem = (key: keyof MasterProfile, id: string) => {
    setProfile(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        return {
          ...prev,
          [key]: list.filter((item: any) => item.id !== id)
        };
      }
      return prev;
    });
  };

  const updateItem = (key: keyof MasterProfile, id: string, field: string, value: string | boolean) => {
    setProfile(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        return {
          ...prev,
          [key]: list.map((item: any) => 
            item.id === id ? { ...item, [field]: value } : item
          )
        };
      }
      return prev;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sticky top-0 bg-slate-900/90 backdrop-blur z-20 py-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="text-indigo-500" />
            Mon Profil
          </h1>
          <p className="text-slate-400 text-sm">
            Base de données brute utilisée par l'IA.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
          />
          
          <button onClick={handleImportClick} className="btn-secondary hidden sm:flex items-center gap-2 px-3 py-2 rounded border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" title="Importer">
            <Upload size={18} />
          </button>

          <button onClick={handleExport} className="btn-secondary hidden sm:flex items-center gap-2 px-3 py-2 rounded border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" title="Exporter">
            <Download size={18} />
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
              status === 'saved' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {status === 'saved' ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {status === 'saved' ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
          
          {onNavigateToSearch && (
             <button 
               onClick={onNavigateToSearch}
               className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ml-2"
             >
               Chercher un Job <ArrowRight size={18} />
             </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Coordonnées & Bio */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-indigo-400" /> Informations Générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Nom Complet" value={profile.fullName} onChange={v => updateField('fullName', v)} placeholder="John Doe" />
            <Input label="Email" value={profile.email} onChange={v => updateField('email', v)} placeholder="john@example.com" />
            <Input label="Téléphone" value={profile.phone} onChange={v => updateField('phone', v)} placeholder="06 12 34 56 78" />
            <Input label="Localisation" value={profile.location} onChange={v => updateField('location', v)} placeholder="Paris, France" />
            <Input label="LinkedIn URL" value={profile.linkedin} onChange={v => updateField('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
            <Input label="Portfolio / GitHub" value={profile.portfolio} onChange={v => updateField('portfolio', v)} placeholder="github.com/johndoe" />
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-semibold mb-2">Bio / Résumé Professionnel</label>
            <textarea 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Je suis un étudiant passionné par..."
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">L'IA réécrira ce texte pour chaque offre.</p>
          </div>
           <div className="mb-4">
            <label className="block text-slate-400 text-sm font-semibold mb-2">Compétences</label>
            <input 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="React, TypeScript, Node.js, Gestion de projet..."
              value={profile.skills}
              onChange={(e) => updateField('skills', e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.split(',').map((skill, i) => skill.trim() && (
                <span key={i} className="px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded text-xs border border-indigo-500/20">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Expériences */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-400" /> Expériences
            </h2>
            <button 
              onClick={() => addItem('experiences', { company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' })}
              className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button 
                  onClick={() => removeItem('experiences', exp.id)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                  <Input label="Entreprise" value={exp.company} onChange={v => updateItem('experiences', exp.id, 'company', v)} />
                  <Input label="Rôle" value={exp.role} onChange={v => updateItem('experiences', exp.id, 'role', v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                   <Input type="month" label="Début" value={exp.startDate} onChange={v => updateItem('experiences', exp.id, 'startDate', v)} />
                   {!exp.isCurrent && (
                     <Input type="month" label="Fin" value={exp.endDate} onChange={v => updateItem('experiences', exp.id, 'endDate', v)} />
                   )}
                   <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={exp.isCurrent}
                          onChange={(e) => updateItem('experiences', exp.id, 'isCurrent', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                        En poste actuellement
                      </label>
                   </div>
                </div>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Détails des missions..."
                  value={exp.description}
                  onChange={(e) => updateItem('experiences', exp.id, 'description', e.target.value)}
                />
              </div>
            ))}
            {profile.experiences.length === 0 && <EmptyState text="Aucune expérience ajoutée." />}
          </div>
        </section>

        {/* 3. Projets */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code size={20} className="text-indigo-400" /> Projets
            </h2>
            <button 
              onClick={() => addItem('projects', { name: '', technologies: '', description: '' })}
              className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-4">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button 
                   onClick={() => removeItem('projects', proj.id)}
                   className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                  <Input label="Nom du Projet" value={proj.name} onChange={v => updateItem('projects', proj.id, 'name', v)} />
                  <Input label="Technologies" value={proj.technologies} onChange={v => updateItem('projects', proj.id, 'technologies', v)} placeholder="React, Python..." />
                </div>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Description du projet..."
                  value={proj.description}
                  onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)}
                />
              </div>
            ))}
            {profile.projects.length === 0 && <EmptyState text="Aucun projet ajouté." />}
          </div>
        </section>

         {/* 4. Formation */}
         <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap size={20} className="text-indigo-400" /> Formation
            </h2>
            <button 
              onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '' })}
              className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button 
                   onClick={() => removeItem('education', edu.id)}
                   className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8 mb-3">
                  <Input label="École" value={edu.school} onChange={v => updateItem('education', edu.id, 'school', v)} />
                  <Input label="Diplôme" value={edu.degree} onChange={v => updateItem('education', edu.id, 'degree', v)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                   <Input type="month" label="Début" value={edu.startDate} onChange={v => updateItem('education', edu.id, 'startDate', v)} />
                   <Input type="month" label="Fin" value={edu.endDate} onChange={v => updateItem('education', edu.id, 'endDate', v)} />
                </div>
              </div>
            ))}
            {profile.education.length === 0 && <EmptyState text="Aucune formation ajoutée." />}
          </div>
        </section>

      </div>
    </div>
  );
};

// Sub-components
const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</label>
    <input 
      type={type}
      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500 gap-2">
    <AlertCircle size={18} /> {text}
  </div>
);
