'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-700">
      <span className="font-medium text-gray-800 dark:text-gray-200">
        Modo Escuro
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">
          {theme === 'dark' ? 'Desativar modo escuro' : 'Ativar modo escuro'}
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;