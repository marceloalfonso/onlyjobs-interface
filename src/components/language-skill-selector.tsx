import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { languageOptions, proficiencyLevels } from '../utils/constants';

export interface LanguageSkill {
  id: string;
  language: string;
  proficiency: string;
}

interface LanguageSkillSelectorProps {
  languageSkills: LanguageSkill[];
  onChange: (languages: LanguageSkill[]) => void;
}

export const LanguageSkillSelector = ({
  languageSkills,
  onChange,
}: LanguageSkillSelectorProps) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const unusedLanguages = languageOptions.filter(
    (lang) => !languageSkills.some((item) => item.language === lang)
  );

  // Ordena os idiomas já selecionados antes de exibir
  const sortedLanguageSkills = [...languageSkills].sort((a, b) =>
    a.language.localeCompare(b.language, 'pt-BR')
  );

  const handleAddLanguage = () => {
    if (!newLanguage || !newProficiency) return;

    const newLanguageSkill: LanguageSkill = {
      id: Math.random().toString(36).substring(2, 9),
      language: newLanguage,
      proficiency: newProficiency,
    };

    onChange([...languageSkills, newLanguageSkill]);
    setNewLanguage('');
    setNewProficiency('');
    setIsAdding(false);
  };

  const handleRemoveLanguage = (id: string) => {
    const updatedLanguages = languageSkills.filter((lang) => lang.id !== id);
    onChange(updatedLanguages);
  };

  const getProficiencyLabel = (value: string): string => {
    const found = proficiencyLevels.find((level) => level.value === value);
    return found ? found.label : value;
  };

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Idiomas de domínio
      </label>

      {/* Lista de idiomas adicionados */}
      {sortedLanguageSkills.length > 0 && (
        <div className='mb-3 space-y-2'>
          {sortedLanguageSkills.map((lang) => (
            <div
              key={lang.id}
              className='flex items-center justify-between bg-gray-50 rounded-md px-3 py-2'
            >
              <div>
                <span className='font-medium'>{lang.language}</span>
                <span className='text-gray-500 text-sm ml-2'>
                  ({getProficiencyLabel(lang.proficiency)})
                </span>
              </div>
              <button
                type='button'
                onClick={() => handleRemoveLanguage(lang.id)}
                className='text-red-500 hover:text-red-700 p-1'
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para adicionar novo idioma */}
      {isAdding ? (
        <div className='bg-gray-50 p-3 rounded-md'>
          <div className='flex flex-col space-y-2 mb-3'>
            <div className='w-full'>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white'
              >
                <option value=''>Selecione um idioma</option>
                {unusedLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className='w-full'>
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white'
              >
                <option value=''>Selecione o nível</option>
                {proficiencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex justify-end space-x-2'>
            <button
              type='button'
              className='px-3 py-1 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md'
              onClick={() => setIsAdding(false)}
            >
              Cancelar
            </button>
            <button
              type='button'
              className='px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50'
              onClick={handleAddLanguage}
              disabled={!newLanguage || !newProficiency}
            >
              Adicionar
            </button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          disabled={unusedLanguages.length === 0}
          className={`flex items-center gap-1 px-3 py-2 text-sm ${
            unusedLanguages.length === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          } rounded-md transition-colors`}
        >
          <Plus size={16} />
          Adicionar idioma
        </button>
      )}
    </div>
  );
};
