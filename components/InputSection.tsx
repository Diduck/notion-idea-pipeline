
import React from 'react';
import { Category } from '../types';

interface InputSectionProps {
  category: Category;
  value: string;
  onChange: (val: string) => void;
  icon: string;
  colorClass: string;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  category, 
  value, 
  onChange, 
  icon, 
  colorClass,
  isProcessing 
}) => {
  return (
    <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`px-4 py-3 flex items-center space-x-2 ${colorClass} shrink-0 self-stretch`}>
        <div className="bg-white/20 p-1.5 rounded-lg">
          <i className={`fa-solid ${icon} text-white text-sm`}></i>
        </div>
        <h3 className="font-bold text-white tracking-tight text-sm whitespace-nowrap">{category}</h3>
      </div>

      <div className="flex-1 px-4 py-2 overflow-hidden">
        <textarea
          disabled={isProcessing}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ajouter vos idées ${category.toLowerCase()} ici (une idée par ligne)...`}
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-black text-sm disabled:opacity-50 resize-none overflow-x-auto whitespace-pre"
          style={{ overflowWrap: 'normal', wordWrap: 'normal' }}
        />
      </div>
    </div>
  );
};

export default InputSection;
