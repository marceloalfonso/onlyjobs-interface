'use client';

import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { Skill } from '../../utils/types';

interface SkillSelectorProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  availableSkills: string[];
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  skills,
  onChange,
  availableSkills,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddSkill = (skillName: string) => {
    if (skills.length >= 20) return; // Limite máximo de habilidades

    const newSkill: Skill = {
      id: Math.random().toString(36).substr(2, 9),
      name: skillName,
      isPriority: skills.length < 5, // Primeiras 5 habilidades são prioritárias
    };

    onChange([...skills, newSkill]);
    setIsOpen(false);
  };

  const handleRemoveSkill = (skillId: string) => {
    const newSkills = skills.filter((skill) => skill.id !== skillId);
    // Reajusta as prioridades após remover uma habilidade
    const updatedSkills = newSkills.map((skill, index) => ({
      ...skill,
      isPriority: index < 5,
    }));
    onChange(updatedSkills);
  };

  const unusedSkills = availableSkills.filter(
    (skill) => !skills.some((s) => s.name === skill)
  );

  return (
    <div className='mt-4'>
      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
        Habilidades
      </label>

      <div className='relative'>
        {/* Selected Skills */}
        <div className='flex flex-wrap gap-2 mb-2'>
          {skills.map((skill) => (
            <div
              key={skill.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                skill.isPriority
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 ring-1 ring-blue-400/30'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {skill.name}
              <button
                type='button'
                onClick={() => handleRemoveSkill(skill.id)}
                className='ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Skill Button and Dropdown */}
        {unusedSkills.length > 0 && (
          <div className='relative'>
            <button
              type='button'
              onClick={() => setIsOpen(!isOpen)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors'
            >
              <Plus size={18} />
              Adicionar Habilidade
            </button>

            {/* Skills Dropdown */}
            {isOpen && (
              <div className='absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700'>
                {unusedSkills.map((skill) => (
                  <button
                    key={skill}
                    type='button'
                    onClick={() => handleAddSkill(skill)}
                    className='w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors first:rounded-t-lg last:rounded-b-lg'
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
