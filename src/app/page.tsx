'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardData } from '../components/card';
import { Header } from '../components/header';
import { isUserSignedIn } from '../utils/auth';

async function getNotLikedUsers(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/not-liked`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (err) {
    return [];
  }
}

async function sendLike(token: string, toUserId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ toUserId }),
    });

    const { message } = await response.json();

    if (!response.ok) {
      throw new Error(message);
    }

    return true;
  } catch (err) {
    return false;
  }
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [cardsData, setCardsData] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  async function handleAccept(cardId: string) {
    if (!token) return;

    setIsLoading(true);
    setError('');

    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      const result = await sendLike(token, cardId);

      if (result) {
        setCurrentCardIndex((prev) => prev + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReject() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setCurrentCardIndex((prev) => prev + 1);
  }

  useEffect(() => {
    if (!isUserSignedIn()) {
      router.push('/sign-in');
      return;
    }

    const storedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const storedUser =
      localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';

    setToken(storedToken);
    setUser(JSON.parse(storedUser));

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    setIsLoading(true);
    setError('');

    if (token) {
      getNotLikedUsers(token)
        .then((notLikedUsers) => {
          if (notLikedUsers.length != 0) {
            const formattedCardsData = notLikedUsers.map(
              (notLikedUser: {
                id: string;
                name: string;
                profile: Record<string, any>;
              }) => {
                if (user?.role === 'CANDIDATE') {
                  const companyCardData = {
                    id: notLikedUser.id,
                    title: notLikedUser.name,
                    company: notLikedUser.name || 'Empresa',
                    stack: notLikedUser.profile.technologies || [],
                    benefits: notLikedUser.profile.benefits || [
                      'Plano de saúde',
                      'Vale refeição',
                    ],
                    companySize:
                      notLikedUser.profile.companySize || 'Não informado',
                    workModel:
                      notLikedUser.profile.workModel || 'Não informado',
                    salary: notLikedUser.profile.salary || 'Não informado',
                  };

                  return companyCardData;
                } else {
                  const candidateCardData = {
                    id: notLikedUser.id,
                    title: notLikedUser.profile.title || notLikedUser.name,
                    company: notLikedUser.name,
                    stack: notLikedUser.profile.skills || [],
                    benefits: ['Experiência relevante', 'Habilidades técnicas'],
                    companySize:
                      notLikedUser.profile.experience || 'Não informado',
                    workModel:
                      notLikedUser.profile.preferredWorkModel ||
                      'Não informado',
                    salary:
                      notLikedUser.profile.expectedSalary || 'Não informado',
                  };

                  return candidateCardData;
                }
              }
            );

            setCardsData(formattedCardsData.sort(() => Math.random() - 0.5));
          } else {
            setCardsData([]);
          }
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : 'Ocorreu um erro inesperado.'
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [router, token, user]);

  const currentCardData = cardsData[currentCardIndex];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-16 h-16 border-4 rounded-full border-t-blue-500 border-b-blue-500 animate-spin'></div>
        <p className='ml-3 text-gray-600'>Carregando...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen overflow-x-hidden bg-white'>
      <Header />
      <div className='flex flex-col flex-grow mt-16'>
        {error && (
          <div className='max-w-xl px-4 py-4 mx-auto mb-6 border-l-4 border-red-400 rounded-md bg-red-50'>
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
                <button
                  onClick={() => setError('')}
                  className='mt-1 text-sm text-red-500 underline hover:text-red-700'
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        <div className='w-full px-4 bg-white shadow-sm'>
          <div className='max-w-6xl mx-auto'>
            <div className='py-6 text-center sm:py-8 md:py-10'>
              <h1 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl'>
                {user?.role === 'CANDIDATE'
                  ? 'Sua carreira dos sonhos está a um match de distância'
                  : 'Encontre os melhores talentos para sua empresa'}
              </h1>
              <p className='text-lg sm:text-xl md:text-2xl text-[#6B4F3D]'>
                Conectando talentos e oportunidades de forma inovadora
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col flex-grow px-4 py-4'>
          <div className='relative flex items-center justify-center w-full max-w-6xl mx-auto'>
            <div className='absolute flex-col items-center hidden font-medium text-red-400 -translate-y-1/2 md:flex left-4 top-1/2'>
              <i className='mb-2 text-2xl fas fa-arrow-left'></i>
              <p className='text-base font-medium text-center md:text-lg'>
                Arraste para
                <br />
                recusar
              </p>
            </div>

            <div className='w-full max-w-sm mx-auto'>
              {cardsData.length === 0 ? (
                <div className='p-6 text-center bg-white shadow-xl rounded-xl'>
                  <h3 className='mb-3 text-xl font-light text-gray-800'>
                    Nenhum match disponível
                  </h3>
                  <p className='text-gray-600'>
                    Volte mais tarde para ver novas oportunidades
                  </p>
                </div>
              ) : currentCardIndex >= cardsData.length ? (
                <div className='p-6 text-center bg-white shadow-xl rounded-xl'>
                  <h3 className='mb-3 text-xl font-light text-gray-800'>
                    Você viu{' '}
                    {user?.role === 'CANDIDATE'
                      ? 'todas as vagas'
                      : 'todos os candidatos'}
                    !
                  </h3>
                  <p className='text-gray-600'>
                    Volte mais tarde para ver novas oportunidades
                  </p>
                </div>
              ) : (
                <>
                  {currentCardData && (
                    <Card
                      data={currentCardData}
                      userRole={user?.role}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  )}

                  {currentCardIndex < cardsData.length && (
                    <div className='flex justify-center gap-6 pb-4 mt-6'>
                      <button
                        onClick={() => handleReject()}
                        className='p-4 text-white transition-transform bg-red-500 rounded-full shadow-lg hover:bg-red-600 active:scale-95 cursor-pointer'
                        aria-label='Recusar'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-6 h-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleAccept(currentCardData.id)}
                        className='p-4 text-white transition-transform bg-green-500 rounded-full shadow-lg hover:bg-green-600 active:scale-95 cursor-pointer'
                        aria-label='Aceitar'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-6 h-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className='absolute flex-col items-center hidden font-medium text-green-400 -translate-y-1/2 md:flex right-4 top-1/2'>
              <i className='mb-2 text-2xl fas fa-arrow-right'></i>
              <p className='text-base font-medium text-center md:text-lg'>
                Arraste para
                <br />
                aceitar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
