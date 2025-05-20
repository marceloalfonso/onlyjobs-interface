import { Lock } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  readOnly?: boolean;
  defaultValue?: string;
}

export const TextField = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  required = false,
  register,
  errors,
  readOnly = false,
  defaultValue,
}: TextFieldProps) => {
  return (
    <div className='mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
        {readOnly && (
          <span className='ml-1 text-xs text-gray-500 font-normal italic'>
            (não editável)
          </span>
        )}
      </label>
      <div className='relative'>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          {...register(id)}
          readOnly={readOnly}
          className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none transition-colors ${
            readOnly
              ? 'bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed pr-10 opacity-80'
              : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500'
          }`}
        />
        {readOnly && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
            <Lock size={16} className='text-gray-500' />
          </div>
        )}
      </div>
      {errors[id] && (
        <p className='mt-1 text-xs text-red-600'>
          {errors[id]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
