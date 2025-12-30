
import React from 'react';
import { Language } from '../services/types';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect }) => {
  const languages = [Language.ENGLISH, Language.HINDI, Language.MARATHI];
  
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === lang 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};