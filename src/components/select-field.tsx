import { ChevronDown } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  options: SelectOption[];
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  required?: boolean;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectField = ({
  id,
  label,
  options,
  register,
  errors,
  required = false,
  defaultValue,
  onChange,
}: SelectFieldProps) => {
  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      <div className='relative'>
        <select
          id={id}
          {...register(id, {
            required: required ? `${label} é obrigatório` : false,
          })}
          defaultValue={defaultValue || ''}
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none'
          onChange={onChange}
        >
          <option value='' disabled hidden>
            Selecione uma opção
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
          <ChevronDown size={18} className='text-gray-500' />
        </div>
      </div>
      {errors[id] && (
        <p className='mt-1 text-xs text-red-600'>
          {errors[id]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
