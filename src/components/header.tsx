'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();

  function isCurrentPath(path: string) {
    return pathname === path;
  }

  const activeLinkClass = 'flex items-center text-blue-600';
  const inactiveLinkClass =
    'flex items-center text-gray-600 hover:text-blue-600';

  return (
    <nav className='bg-white shadow-sm fixed w-full top-0 z-[100] h-16 border-b border-gray-200'>
      <div className='w-full h-full mx-auto'>
        <div className='flex items-center justify-between h-full p-4'>
          <div className='flex items-center'>
            <Link href='/' className='flex items-center'>
              <Image
                src='/logo.png'
                alt='OnlyJobs Logo'
                width={40}
                height={40}
                className='mr-2'
              />
              <span className='text-blue-600 text-2xl font-bold hidden sm:inline'>
                OnlyJobs
              </span>
            </Link>
          </div>

          <div className='flex items-center space-x-6'>
            <Link
              href='/'
              className={
                isCurrentPath('/') ? activeLinkClass : inactiveLinkClass
              }
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6 md:mr-2'
              >
                <path d='M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z' />
                <path d='M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z' />
              </svg>
              <span className='hidden md:inline'>Início</span>
            </Link>
            <Link
              href='/chats'
              className={
                isCurrentPath('/chats') ? activeLinkClass : inactiveLinkClass
              }
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6 md:mr-2'
              >
                <path
                  fillRule='evenodd'
                  d='M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z'
                />
              </svg>
              <span className='hidden md:inline'>Chats</span>
            </Link>
            <Link
              href='/profile'
              className={
                isCurrentPath('/profile') ? activeLinkClass : inactiveLinkClass
              }
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6 md:mr-2'
              >
                <path
                  fillRule='evenodd'
                  d='M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='hidden md:inline'>Perfil</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
