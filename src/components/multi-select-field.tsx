'use client';

import React, { useEffect, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  id: string;
  label: string;
  options: Option[];
  defaultValue?: string[];
  onChange: (selectedOptions: string[]) => void;
  helpText?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  id,
  label,
  options,
  defaultValue = [],
  onChange,
  helpText,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultValue);

  const toggleOption = (value: string) => {
    const updatedSelection = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];

    setSelectedOptions(updatedSelection);
    onChange(updatedSelection);
  };

  useEffect(() => {
    // Atualizar selecionados quando defaultValue mudar
    if (defaultValue && defaultValue.length > 0) {
      setSelectedOptions(defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block mb-1 text-sm font-medium text-gray-700'
      >
        {label}
      </label>

      <div className='mt-1 space-y-2'>
        <div className='flex flex-wrap gap-2'>
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => toggleOption(option.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedOptions.includes(option.value)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {helpText && <p className='mt-1 text-xs text-gray-500'>{helpText}</p>}
      </div>
    </div>
  );
};
