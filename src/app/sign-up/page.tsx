'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SignUpForm } from '../../components/sign-up-form';
import { isUserSignedIn } from '../../utils/auth';

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserSignedIn()) {
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center min-h-screen py-6 bg-gradient-to-br from-indigo-50 to-blue-50 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='relative h-30 w-30'>
            <Image
              src='/logo.png'
              alt='OnlyJobs Logo'
              width={300}
              height={300}
              className='object-contain'
            />
          </div>
        </div>

        <h2 className='mt-6 text-3xl font-extrabold text-center text-gray-900'>
          Criar conta
        </h2>

        <p className='mt-2 text-sm text-center text-gray-600'>
          Inicie sua jornada e explore o mercado de trabalho de um jeito nunca
          antes visto!
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <SignUpForm />
      </div>
    </div>
  );
}
