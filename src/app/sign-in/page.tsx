'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SignInForm } from '../../components/sign-in-form';
import { isUserSignedIn } from '../../utils/auth';

export default function SignIn() {
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
    <div className='flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50'>
      <div className='flex flex-col w-full max-w-6xl overflow-hidden bg-white shadow-lg rounded-xl md:flex-row'>
        <div className='hidden w-full p-4 md:w-1/2 md:p-0 md:block'>
          <div className='flex items-center justify-center w-full h-full overflow-hidden bg-indigo-100 rounded-lg md:rounded-none'>
            <div className='p-6 text-center'>
              <div className='flex items-center justify-center w-40 h-40 mx-auto mb-6'>
                <Image
                  src='/logo.png'
                  alt='OnlyJobs Logo'
                  width={300}
                  height={300}
                  className='object-contain'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='w-full p-6 space-y-6 md:w-1/2 md:p-12'>
          <div className='flex justify-center mb-6 md:hidden'>
            <div className='flex items-center justify-center w-20 h-20'>
              <Image
                src='/logo.png'
                alt='OnlyJobs Logo'
                width={80}
                height={80}
                className='object-contain'
              />
            </div>
          </div>

          <p className='text-2xl text-center text-gray-600'>
            Faça login para continuar
          </p>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
