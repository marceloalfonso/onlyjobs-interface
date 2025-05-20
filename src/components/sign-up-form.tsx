'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  blockPasteWithSpaces,
  blockSpaceKeyPress,
} from '../utils/input-validators';

const signUpFormSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome de usuário deve ter pelo menos 2 caracteres')
    .max(30, 'O nome de usuário não pode ter mais de 30 caracteres')
    .transform((name) => name.trim()),
  email: z
    .string()
    .email('Formato de e-mail inválido')
    .toLowerCase()
    .refine((email) => !email.includes(' '), {
      message: 'O e-mail não pode conter espaços',
    })
    .transform((email) => email.trim()),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine((password) => !password.includes(' '), {
      message: 'A senha não pode conter espaços',
    })
    .transform((password) => password.trim()),
  role: z.enum(['CANDIDATE', 'COMPANY']),
});

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
  });

  async function signUp(formData: SignUpFormData) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            profile: {},
          }),
        }
      );

      const { message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      router.push('/sign-in');
      return;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível fazer o cadastro.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  const selectedRole = watch('role');

  return (
    <>
      {error && (
        <div className='p-4 mb-4 border-l-4 border-red-400 rounded bg-red-50'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='w-5 h-5 text-red-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className='space-y-6' onSubmit={handleSubmit(signUp)}>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Nome de usuário
          </label>
          <div className='mt-1'>
            <input
              id='name'
              type='text'
              {...register('name')}
              className='block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-[#004aad] focus:border-[#004aad] sm:text-sm'
            />
            {errors.name && (
              <p className='mt-1 text-xs text-red-600'>{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Endereço de e-mail
          </label>
          <div className='mt-1'>
            <input
              id='email'
              type='email'
              {...register('email')}
              onKeyDown={blockSpaceKeyPress}
              onPaste={blockPasteWithSpaces}
              className='block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-[#004aad] focus:border-[#004aad] sm:text-sm'
            />
            {errors.email && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700'
          >
            Senha
          </label>
          <div className='mt-1'>
            <input
              id='password'
              type='password'
              {...register('password')}
              onKeyDown={blockSpaceKeyPress}
              onPaste={blockPasteWithSpaces}
              className='block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-[#004aad] focus:border-[#004aad] sm:text-sm'
            />
            {errors.password && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='role'
            className='block text-sm font-medium text-gray-700'
          >
            Tipo de conta
          </label>
          <input type='hidden' {...register('role')} />
          <div className='mt-1'>
            <div className='grid grid-cols-2 gap-3'>
              <div
                onClick={() =>
                  setValue('role', 'CANDIDATE', { shouldValidate: true })
                }
                className={`cursor-pointer border rounded-md p-4 text-center transition-colors ${
                  selectedRole === 'CANDIDATE'
                    ? 'bg-[#e6eeff] border-[#004aad]'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-8 h-8 mx-auto text-[#004aad]'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                <span className='block mt-2 text-sm font-medium text-gray-900'>
                  Candidato
                </span>
              </div>
              <div
                onClick={() =>
                  setValue('role', 'COMPANY', { shouldValidate: true })
                }
                className={`cursor-pointer border rounded-md p-4 text-center transition-colors ${
                  selectedRole === 'COMPANY'
                    ? 'bg-[#e6eeff] border-[#004aad]'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-8 h-8 mx-auto text-[#004aad]'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
                <span className='block mt-2 text-sm font-medium text-gray-900'>
                  Empresa
                </span>
              </div>
            </div>
            {errors.role && (
              <p className='mt-1 text-xs text-red-600'>{errors.role.message}</p>
            )}
          </div>
        </div>

        {selectedRole && (
          <div className='pt-4 border-t border-gray-200'>
            <div className='p-4 border border-blue-100 rounded-md bg-blue-50'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='w-5 h-5 text-blue-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='flex-1 ml-3 md:flex md:justify-between'>
                  <p className='text-sm text-blue-700'>
                    Você poderá completar seu perfil de{' '}
                    {selectedRole === 'CANDIDATE' ? 'candidato' : 'empresa'}{' '}
                    após o cadastro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type='submit'
            disabled={isLoading}
            className='flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#004aad] border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-[#003b8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004aad] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <>
                <svg
                  className='w-4 h-4 mr-2 -ml-1 text-white animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Cadastrando...
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
        </div>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 text-gray-500 bg-white'>
              Já tem uma conta?
            </span>
          </div>
        </div>

        <div className='mt-6'>
          <Link
            href='/sign-in'
            className='flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004aad]'
          >
            Faça login
          </Link>
        </div>
      </div>
    </>
  );
};
