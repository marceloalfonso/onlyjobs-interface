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

const signInFormSchema = z.object({
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
    .refine((password) => !password.includes(' '), {
      message: 'A senha não pode conter espaços',
    })
    .transform((password) => password.trim()),
  rememberMe: z.boolean(),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

async function getUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: {
        Authorization: token,
      },
    });

    const { message, ...user } = await response.json();

    if (!response.ok) {
      throw new Error(message);
    }

    return user;
  } catch (err) {
    return null;
  }
}

export const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
  });

  async function signIn(formData: SignInFormData) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const { token, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      const user = await getUser(token);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      localStorage.clear();
      sessionStorage.clear();

      if (formData.rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);
      }

      router.push('/');
      return;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'E-mail ou senha inválidos. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className='p-4 border-l-4 border-red-400 rounded-md bg-red-50'>
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

      <form onSubmit={handleSubmit(signIn)} className='space-y-4 md:space-y-6'>
        <div>
          <label
            htmlFor='email'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Endereço de e-mail
          </label>
          <input
            id='email'
            type='email'
            {...register('email')}
            onKeyDown={blockSpaceKeyPress}
            onPaste={blockPasteWithSpaces}
            className='w-full px-3 py-2 text-base text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg md:px-4 md:py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
          {errors.email && (
            <p className='mt-1 text-xs text-red-600'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Senha
          </label>
          <input
            id='password'
            type='password'
            {...register('password')}
            onKeyDown={blockSpaceKeyPress}
            onPaste={blockPasteWithSpaces}
            className='w-full px-3 py-2 text-base text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg md:px-4 md:py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
          {errors.password && (
            <p className='mt-1 text-xs text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              id='rememberMe'
              type='checkbox'
              {...register('rememberMe')}
              className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
            />
            <label htmlFor='rememberMe' className='ml-2 text-sm text-gray-700'>
              Lembrar de mim
            </label>
          </div>

          <div className='text-sm'>
            <Link
              href='#'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='cursor-pointer w-full flex justify-center py-2.5 md:py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center'>
              <svg
                className='w-5 h-5 mr-3 -ml-1 text-white animate-spin'
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
              Entrando...
            </div>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className='text-center'>
        <p className='mt-6 text-base text-gray-600'>
          Ainda não tem uma conta?{' '}
          <Link
            href='/sign-up'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </>
  );
};
