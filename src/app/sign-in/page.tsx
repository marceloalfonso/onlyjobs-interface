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
        <div className='w-12 h-12 border-t-2 border-b-2 border-[#004aad] rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-[#e6eeff]'>
      <div className='flex flex-col w-full max-w-6xl overflow-hidden bg-white shadow-lg rounded-xl md:flex-row'>
        <div className='hidden w-full md:w-1/2 md:block'>
          <div className='flex items-center justify-center w-full h-full overflow-hidden bg-[#e6eeff] rounded-l-xl'>
            <Image
              src='/sign-in-image.jpeg'
              width={1000}
              height={1000}
              alt='Login illustration'
              className='object-cover w-full h-full xl:block hidden'
              style={{ borderRadius: 'inherit' }}
            />

            <div className='hidden xl:hidden md:flex items-center justify-center w-full h-full p-4 md:p-6 lg:p-8'>
              <Image
                src='/logo.png'
                alt='OnlyJobs Logo'
                width={300}
                height={300}
                className='object-contain w-auto h-auto max-w-[70%] max-h-[70%]'
                priority
              />
            </div>
          </div>
        </div>

        <div className='w-full p-6 space-y-6 md:w-1/2 md:p-12 bg-white md:border-l md:shadow-[-10px_0_15px_-15px_rgba(0,0,0,0.1)]'>
          <div className='flex justify-center mb-6 md:hidden'>
            <div className='flex items-center justify-center w-30 h-30'>
              <Image
                src='/logo.png'
                alt='OnlyJobs Logo'
                width={200}
                height={200}
                className='object-contain'
              />
            </div>
          </div>

          <p className='text-2xl font-bold text-center text-gray-900'>
            Faça login para continuar
          </p>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
