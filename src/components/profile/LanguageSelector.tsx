'use client';

import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
];

const LanguageSelector: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    // Aqui você pode adicionar lógica para alterar o idioma da aplicação
  };

  return (
    <div className='py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-700'>
      <label
        htmlFor='language'
        className='block font-medium text-gray-800 dark:text-gray-200 mb-1'
      >
        Idioma
      </label>
      <div className='relative'>
        <select
          id='language'
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className='w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} className='py-2'>
              {lang.label}
            </option>
          ))}
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300'>
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
