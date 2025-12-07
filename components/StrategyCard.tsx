import React from 'react';
import { JobMethod } from '../types';
import { CheckCircle2, XCircle, Star, ArrowRight } from 'lucide-react';

interface StrategyCardProps {
  method: JobMethod;
  onClick: () => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ method, onClick }) => {
  return (
    <div 
      className={`relative p-6 rounded-xl border transition-all duration-300 cursor-pointer group
      ${method.recommended 
        ? 'bg-slate-800/80 border-indigo-500 shadow-lg shadow-indigo-500/20' 
        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}
      onClick={onClick}
    >
      {method.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Star size={12} fill="currentColor" /> RECOMMANDÉ
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
          {method.title}
        </h3>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${i < method.rating ? 'bg-indigo-500' : 'bg-slate-600'}`} 
            />
          ))}
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-6 min-h-[60px]">
        {method.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block">Avantages</span>
          <ul className="space-y-1">
            {method.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 block">Inconvénients</span>
          <ul className="space-y-1">
            {method.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {method.recommended && (
        <div className="flex justify-end">
           <button className="text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
             Tester cette méthode <ArrowRight size={16} />
           </button>
        </div>
      )}
    </div>
  );
};