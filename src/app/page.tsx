'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardData } from '../components/card';
import { Header } from '../components/header';
import { MatchAnimation } from '../components/match-animation';
import { isUserSignedIn } from '../utils/auth';
import { calculateAge } from '../utils/date-formatters';
import { Skill, User } from '../utils/types';

// Opções de seleção para usar na formatação dos dados dos cards
const educationOptions = [
  { value: 'fundamental', label: 'Ensino Fundamental' },
  { value: 'medio', label: 'Ensino Médio' },
  { value: 'tecnico', label: 'Ensino Técnico' },
  { value: 'superior_incompleto', label: 'Superior Incompleto' },
  { value: 'superior_cursando', label: 'Superior em Andamento' },
  { value: 'superior', label: 'Superior Completo' },
  { value: 'posgraduacao', label: 'Pós-graduação' },
  { value: 'mestrado', label: 'Mestrado' },
  { value: 'doutorado', label: 'Doutorado' },
];

const experienceOptions = [
  { value: 'sem_experiencia', label: 'Sem experiência' },
  { value: 'menos_1', label: 'Menos de 1 ano' },
  { value: '1_2', label: '1-2 anos' },
  { value: '3_5', label: '3-5 anos' },
  { value: '6_10', label: '6-10 anos' },
  { value: 'mais_10', label: 'Mais de 10 anos' },
];

const seniorityOptions = [
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'lideranca', label: 'Liderança/Gestão' },
];

const availabilityOptions = [
  { value: 'integral', label: 'Tempo Integral' },
  { value: 'parcial', label: 'Meio Período' },
  { value: 'freelancer', label: 'Freelancer/Projetos' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'aprendiz', label: 'Jovem Aprendiz' },
];

// Opções específicas para empresas
const industrySectorOptions = [
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'educacao', label: 'Educação' },
  { value: 'financas', label: 'Finanças' },
  { value: 'industria', label: 'Indústria' },
  { value: 'logistica', label: 'Logística/Transporte' },
  { value: 'marketing', label: 'Marketing/Publicidade' },
  { value: 'outro', label: 'Outro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'telecomunicacoes', label: 'Telecomunicações' },
  { value: 'turismo', label: 'Turismo/Hotelaria' },
  { value: 'varejo', label: 'Varejo' },
];

const companySizeOptions = [
  { value: 'startup', label: 'Startup' },
  { value: 'pequena', label: 'Pequena' },
  { value: 'media', label: 'Média' },
  { value: 'grande', label: 'Grande' },
  { value: 'multinacional', label: 'Multinacional' },
];

const workModelOptions = [
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
];

const benefitsOptions = [
  { value: 'auxilio_creche', label: 'Auxílio-creche' },
  { value: 'home_office', label: 'Auxílio home office' },
  { value: 'bonus', label: 'Bônus/Comissões' },
  { value: 'cursos', label: 'Cursos/Capacitação' },
  { value: 'day_off', label: 'Day off de aniversário' },
  { value: 'gympass', label: 'Gympass/Academia' },
  { value: 'horario_flexivel', label: 'Horário flexível' },
  { value: 'participacao_lucros', label: 'Participação nos lucros' },
  { value: 'plano_odontologico', label: 'Plano odontológico' },
  { value: 'plano_saude', label: 'Plano de saúde' },
  { value: 'seguro_vida', label: 'Seguro de vida' },
  { value: 'vale_alimentacao', label: 'Vale-alimentação' },
  { value: 'vale_refeicao', label: 'Vale-refeição' },
];

const companyTechnologiesOptions = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'c_sharp', label: 'C#' },
  { value: 'data_science', label: 'Ciência de Dados' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'docker', label: 'Docker' },
  { value: 'gcp', label: 'Google Cloud' },
  { value: 'ia', label: 'Inteligência Artificial' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'node', label: 'Node.js' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'typescript', label: 'TypeScript' },
];

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

async function sendLike(token: string, toUserId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ toUserId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return {
      likeId: data.likeId,
      chatId: data.chatId,
      isMatch: !!data.chatId,
    };
  } catch (err) {
    return { likeId: null, chatId: null, isMatch: false };
  }
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cardsData, setCardsData] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [matchedUserName, setMatchedUserName] = useState<string | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUserProfileImage, setMatchedUserProfileImage] = useState<
    string | undefined
  >(undefined);

  async function handleAccept(cardId: string) {
    if (!token) return;

    setIsLoading(true);
    setError('');

    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      const result = await sendLike(token, cardId);

      if (result.isMatch) {
        const matchedCardData = cardsData.find((card) => card.id === cardId);

        if (matchedCardData) {
          setMatchedUserName(matchedCardData.title || matchedCardData.company);

          if (matchedCardData.profilePicture) {
            setMatchedUserProfileImage(matchedCardData.profilePicture);
          } else {
            setMatchedUserProfileImage(undefined);
          }

          setShowMatchAnimation(true);
        }
      }

      setCurrentCardIndex((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível dar like.'
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
                  // Formatação de dados para cards de empresas, vistos pelos candidatos
                  const companyCardData = {
                    id: notLikedUser.id,
                    title: notLikedUser.name,
                    company: notLikedUser.name || 'Empresa',
                    // Tecnologias da empresa convertidas de array de valores para strings
                    stack: Array.isArray(
                      notLikedUser.profile?.companyTechnologies
                    )
                      ? notLikedUser.profile.companyTechnologies.map(
                          (tech: string) => {
                            // Encontra o label correspondente no array de opções
                            const techOption = companyTechnologiesOptions.find(
                              (option) => option.value === tech
                            );
                            return techOption ? techOption.label : tech;
                          }
                        )
                      : [],
                    // Benefícios oferecidos pela empresa
                    benefits: Array.isArray(notLikedUser.profile?.benefits)
                      ? notLikedUser.profile.benefits.map((benefit: string) => {
                          // Encontra o label correspondente no array de opções
                          const benefitOption = benefitsOptions.find(
                            (option) => option.value === benefit
                          );
                          return benefitOption ? benefitOption.label : benefit;
                        })
                      : ['Sem benefícios cadastrados'],
                    // Informações adicionais da empresa
                    companySize: (() => {
                      const sizeValue = notLikedUser.profile?.companySize;
                      if (!sizeValue) return 'Não informado';
                      const sizeOption = companySizeOptions.find(
                        (option) => option.value === sizeValue
                      );
                      return sizeOption ? sizeOption.label : sizeValue;
                    })(),
                    workModel: (() => {
                      const modelValue = notLikedUser.profile?.workModel;
                      if (!modelValue) return 'Não informado';
                      const modelOption = workModelOptions.find(
                        (option) => option.value === modelValue
                      );
                      return modelOption ? modelOption.label : modelValue;
                    })(),
                    salary: notLikedUser.profile?.salary || 'A combinar',
                    profilePicture: notLikedUser.profile?.picture || undefined,
                    // Adicionando os campos extras
                    location: notLikedUser.profile?.location || undefined,
                    summary: notLikedUser.profile?.summary || undefined,
                    // Formatar as áreas de contratação
                    hiringAreas: Array.isArray(
                      notLikedUser.profile?.hiringAreas
                    )
                      ? notLikedUser.profile.hiringAreas
                      : [],
                    // Adicionar o campo de setor/indústria
                    industrySector: (() => {
                      const sector = notLikedUser.profile?.industrySector;
                      if (!sector) return undefined;
                      const sectorOption = industrySectorOptions.find(
                        (option) => option.value === sector
                      );
                      return sectorOption ? sectorOption.label : sector;
                    })(),
                    // Incluir website da empresa
                    website: notLikedUser.profile?.website || undefined,
                  };

                  return companyCardData;
                } else {
                  // Formatação de dados para cards de candidatos, vistos pelas empresas
                  const candidateCardData = {
                    id: notLikedUser.id,
                    title: notLikedUser.name, // Título será o nome do usuário
                    company: notLikedUser.name, // Mantendo o nome do usuário aqui também
                    // Adicionar campo de senioridade separado
                    seniority: (() => {
                      const seniority = notLikedUser.profile?.seniority;
                      if (!seniority) return undefined;

                      const seniorityOption = seniorityOptions.find(
                        (option) => option.value === seniority
                      );
                      return seniorityOption
                        ? seniorityOption.label
                        : seniority;
                    })(),
                    // Calcula a idade a partir da data de nascimento
                    age: notLikedUser.profile?.birthDate
                      ? calculateAge(notLikedUser.profile.birthDate)
                      : undefined,
                    // Processa idiomas do candidato
                    languages: Array.isArray(
                      notLikedUser.profile?.languageSkills
                    )
                      ? notLikedUser.profile.languageSkills.map((lang: any) => {
                          if (typeof lang === 'object' && lang !== null) {
                            const language = lang.language || '';
                            // Traduzindo proficiências para português
                            let proficiency = lang.proficiency || '';
                            switch (proficiency.toLowerCase()) {
                              case 'native':
                                proficiency = 'nativo';
                                break;
                              case 'fluent':
                                proficiency = 'fluente';
                                break;
                              case 'advanced':
                                proficiency = 'avançado';
                                break;
                              case 'intermediate':
                                proficiency = 'intermediário';
                                break;
                              case 'basic':
                                proficiency = 'básico';
                                break;
                              default:
                                break;
                            }
                            return `${language} (${proficiency})`;
                          }
                          return String(lang || '');
                        })
                      : [],
                    // Habilidades do candidato
                    stack: Array.isArray(notLikedUser.profile?.skills)
                      ? notLikedUser.profile.skills
                          .filter(
                            (skill: Skill) =>
                              typeof skill === 'object' && skill !== null
                          )
                          .map((skill: Skill) =>
                            typeof skill === 'object' && skill !== null
                              ? skill.name || ''
                              : String(skill || '')
                          )
                      : [],
                    // Formação e disponibilidade como qualificações
                    // Removendo a duplicação da disponibilidade, mantendo apenas formação e outras qualificações
                    benefits: [
                      (() => {
                        const edu = notLikedUser.profile?.education;
                        if (!edu) return 'Formação não informada';
                        const eduOption = educationOptions.find(
                          (option) => option.value === edu
                        );
                        return eduOption
                          ? `Formação: ${eduOption.label}`
                          : `Formação: ${edu}`;
                      })(),
                      // Adicionar o curso se estiver disponível e for um curso de nível superior
                      (() => {
                        const edu = notLikedUser.profile?.education;
                        const course = notLikedUser.profile?.course;

                        // Verifica se é uma formação superior e se tem curso informado
                        if (
                          course &&
                          edu &&
                          [
                            'superior_incompleto',
                            'superior_cursando',
                            'superior',
                            'posgraduacao',
                            'mestrado',
                            'doutorado',
                          ].includes(edu)
                        ) {
                          return `Curso: ${course}`;
                        }
                        return null;
                      })(),
                    ].filter(Boolean), // Remove itens nulos da lista
                    // Anos de experiência
                    companySize: (() => {
                      const exp = notLikedUser.profile?.experienceYears;
                      if (!exp) return 'Não informado';
                      const expOption = experienceOptions.find(
                        (option) => option.value === exp
                      );
                      return expOption ? expOption.label : exp;
                    })(),
                    // Disponibilidade
                    workModel: (() => {
                      const avail = notLikedUser.profile?.availability;
                      if (!avail) return 'Não informado';
                      const availOption = availabilityOptions.find(
                        (option) => option.value === avail
                      );
                      return availOption ? availOption.label : avail;
                    })(),
                    // Pretensão salarial (adicionado)
                    salary:
                      notLikedUser.profile?.expectedSalary || 'A combinar',
                    profilePicture: notLikedUser.profile?.picture || undefined,
                    // Novos campos para o card redesenhado
                    summary: notLikedUser.profile?.summary || undefined,
                    location: notLikedUser.profile?.location || undefined,
                  };

                  return candidateCardData;
                }
              }
            );

            setCardsData(formattedCardsData);
          } else {
            setCardsData([]);
          }
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível encontrar usuários que ainda não foram curtidos.'
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
      {matchedUserName && showMatchAnimation && (
        <MatchAnimation
          matchedUserName={matchedUserName}
          userRole={user?.role}
          onClose={() => setShowMatchAnimation(false)}
          userProfileImage={user?.profile?.picture}
          matchedUserProfileImage={matchedUserProfileImage}
        />
      )}
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
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
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
        <div className='w-full px-4 bg-white'>
          <div className='max-w-6xl mx-auto'>
            <div className='py-4 text-center sm:py-5'>
              <h1 className='mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl'>
                {user?.role === 'CANDIDATE'
                  ? 'Encontre sua oportunidade ideal'
                  : 'Encontre talentos para sua empresa'}
              </h1>
              <p className='text-base text-[#6B4F3D] sm:text-lg'>
                Conectando talentos e oportunidades
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col flex-grow px-4 py-4'>
          <div className='relative flex items-center justify-center w-full max-w-6xl mx-auto'>
            <div className='absolute flex-col items-center hidden font-medium text-red-400 -translate-y-1/2 md:flex left-4 top-1/2'>
              <p className='text-base font-medium text-center md:text-lg'>
                Arraste para
                <br />
                recusar
              </p>
            </div>

            <div className='w-full max-w-lg mx-auto'>
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
