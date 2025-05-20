'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Role } from '../utils/types';

interface MatchAnimationProps {
  matchedUserName: string;
  userRole: Role;
  onClose: () => void;
  userProfileImage?: string; // Imagem do usuário atual
  matchedUserProfileImage?: string; // Imagem do usuário com quem deu match
}

export const MatchAnimation = ({
  matchedUserName,
  userRole,
  onClose,
  userProfileImage,
  matchedUserProfileImage,
}: MatchAnimationProps) => {
  const [animationStage, setAnimationStage] = useState(0);

  const isCandidate = userRole === 'CANDIDATE';

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 300);
    const timer2 = setTimeout(() => setAnimationStage(2), 1000);
    const timer3 = setTimeout(() => setAnimationStage(3), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Função para renderizar a imagem de perfil ou o fallback de ícone
  const renderProfileImage = (
    imageSrc: string | undefined,
    isCurrentUser: boolean
  ) => {
    if (imageSrc) {
      return (
        <div className='w-full h-full relative overflow-hidden bg-gray-100'>
          <Image
            src={imageSrc}
            alt='Foto de perfil'
            layout='fill'
            objectFit='cover'
            className='rounded-full'
          />
        </div>
      );
    } else {
      // Renderiza o ícone SVG como fallback
      return (
        <div className='w-full h-full flex items-center justify-center bg-white'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='none'
            viewBox='0 0 24 24'
            stroke='#004aad'
            strokeWidth='2'
          >
            {isCurrentUser ? (
              isCandidate ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                />
              )
            ) : isCandidate ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            )}
          </svg>
        </div>
      );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-blue-50 to-[#e6eeff] bg-opacity-95 transition-opacity duration-500 ${
        animationStage > 0 ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className='relative flex flex-col items-center justify-center p-8 transform transition-all duration-500 text-center bg-white rounded-xl shadow-2xl max-w-md w-full mx-4'
        style={{
          transform: animationStage >= 2 ? 'scale(1)' : 'scale(0.5)',
          opacity: animationStage >= 2 ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl'>
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className='absolute animate-float'
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.1,
                transform: `scale(${Math.random() * 0.6 + 0.4})`,
                animation: `float ${
                  Math.random() * 3 + 3
                }s infinite ease-in-out ${Math.random() * 2}s`,
              }}
            >
              <div className='text-4xl'>
                {['✓', '⭐', '🔍', '🤝', '📈'][Math.floor(Math.random() * 5)]}
              </div>
            </div>
          ))}
        </div>

        <div className='mb-4 bg-[#004aad] p-4 rounded-full relative z-10'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='40'
            height='40'
            fill='none'
            viewBox='0 0 24 24'
            stroke='white'
            strokeWidth='2'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>

        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 relative z-10'>
          <span className='text-[#004aad]'>
            {isCandidate
              ? 'Você está mais perto de um novo emprego!'
              : 'Um novo colaborador pode estar a caminho!'}
          </span>
        </h1>

        <div className='flex items-center justify-center mb-8 relative z-10'>
          <div className='w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#e6eeff] shadow-lg transform -translate-x-4'>
            {renderProfileImage(userProfileImage, true)}
          </div>

          <div className='w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#e6eeff] shadow-lg transform translate-x-4'>
            {renderProfileImage(matchedUserProfileImage, false)}
          </div>
        </div>

        <p className='text-lg text-gray-700 mb-8 font-medium relative z-10 px-4'>
          Uma conexão com{' '}
          <span className='font-bold text-[#004aad]'>{matchedUserName}</span>
          {' foi estabelecida!'}
        </p>

        <div
          className={`flex gap-4 transform transition-all duration-500 relative z-10 ${
            animationStage >= 3
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
        >
          <Link
            href={'/chats'}
            className='px-6 py-3 bg-[#004aad] text-white font-medium rounded-lg hover:bg-[#003b8a] transition-all'
          >
            Iniciar bate-papo
          </Link>
          <button
            onClick={onClose}
            className='px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all'
          >
            Fechar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
