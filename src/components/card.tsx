'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  calculateRotation,
  calculateScale,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
  preventImageDrag,
} from '../utils/drag-handlers';
import { Position, Role } from '../utils/types';

const cardDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  stack: z.array(z.string()),
  benefits: z.array(z.string()),
  companySize: z.string(),
  workModel: z.string(),
  salary: z.string(),
  profilePicture: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  seniority: z.string().optional(),
  languages: z.array(z.string()).optional(),
  age: z.number().optional(),
  hiringAreas: z.array(z.string()).optional(),
  industrySector: z.string().optional(), // Setor/Indústria
  website: z.string().optional(), // Site da empresa
});

export type CardData = z.infer<typeof cardDataSchema>;

interface CardProps {
  data: CardData;
  userRole: Role;
  onAccept: (cardId: string) => void;
  onReject: () => void;
}

export const Card = ({ data, userRole, onAccept, onReject }: CardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState<Position>({ x: 0, y: 0 });
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const rotation = calculateRotation(position.x);
  const scale = calculateScale(position.x);

  const mainTitle = userRole === 'COMPANY' ? data.company : data.title;

  return (
    <div
      className='relative mx-0 select-none touch-none cursor-grab active:cursor-grabbing'
      onMouseDown={(e) =>
        handleDragStart(
          e,
          position,
          startPosition,
          setStartPosition,
          setIsDragging
        )
      }
      onTouchStart={(e) =>
        handleDragStart(
          e,
          position,
          startPosition,
          setStartPosition,
          setIsDragging
        )
      }
      onMouseMove={(e) =>
        handleDragMove(e, position, startPosition, setPosition, isDragging)
      }
      onTouchMove={(e) =>
        handleDragMove(e, position, startPosition, setPosition, isDragging)
      }
      onMouseUp={() =>
        handleDragEnd(
          position,
          setPosition,
          setIsDragging,
          () => onAccept(data.id),
          () => onReject()
        )
      }
      onTouchEnd={() =>
        handleDragEnd(
          position,
          setPosition,
          setIsDragging,
          () => onAccept(data.id),
          () => onReject()
        )
      }
      onMouseLeave={() =>
        isDragging &&
        handleDragEnd(
          position,
          setPosition,
          setIsDragging,
          () => onAccept(data.id),
          () => onReject()
        )
      }
      style={{
        transform: `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'all 0.3s ease',
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl overflow-hidden relative w-full md:w-[500px] ${
          position.x > 25
            ? 'ring-2 ring-green-400'
            : position.x < -25
            ? 'ring-2 ring-red-400'
            : ''
        }`}
      >
        {/* Header com fundo azul claro, foto circular à esquerda e informações básicas à direita */}
        <div className='flex items-center p-4 bg-blue-50 relative'>
          {/* Foto de perfil circular */}
          <div className='relative mr-4'>
            {data.profilePicture ? (
              <div className='w-28 h-28 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center'>
                <img
                  src={data.profilePicture}
                  alt={`Foto de perfil de ${mainTitle}`}
                  className='object-cover w-full h-full select-none'
                  onDragStart={preventImageDrag}
                  draggable='false'
                />
              </div>
            ) : (
              <div className='w-28 h-28 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='56'
                  height='56'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='#004aad'
                  strokeWidth='1.5'
                >
                  {userRole === 'CANDIDATE' ? (
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
            )}
          </div>

          {/* Informações básicas à direita - com melhor distribuição vertical */}
          <div className='flex-1 flex flex-col justify-center h-28 py-1'>
            {/* Nome (sempre) */}
            <h2 className='text-lg md:text-xl font-semibold text-gray-800 mb-0.5'>
              {mainTitle}
            </h2>
            {/* Idade (apenas para candidato, abaixo do nome) */}
            {userRole === 'COMPANY' && data.age && (
              <div className='text-gray-500 text-base mb-1'>
                {data.age} anos
              </div>
            )}
            {/* Setor (empresa) */}
            {userRole === 'CANDIDATE' && data.industrySector && (
              <div className='text-sm text-gray-600 font-medium mb-1'>
                {data.industrySector}
              </div>
            )}
            {/* Localização (empresa) */}
            {data.location && (
              <div className='text-gray-500 text-sm flex items-center mb-2'>
                <span>{data.location}</span>
              </div>
            )}
            {/* Senioridade (empresa) */}
            {userRole === 'COMPANY' && data.seniority && (
              <div className='text-blue-600 font-medium text-sm'>
                {data.seniority}
              </div>
            )}
          </div>

          {/* URL do site no canto inferior direito do header, apenas para card de empresa */}
          {userRole === 'CANDIDATE' && data.website && (
            <a
              href={data.website}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='absolute right-4 bottom-2 text-blue-600 hover:underline text-xs bg-white/80 px-2 py-0.5 rounded shadow-sm max-w-[50%] truncate'
              title={data.website}
            >
              {data.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
            </a>
          )}
        </div>

        <div className='px-4 py-3'>
          {/* Resumo (se disponível) */}
          {data.summary && (
            <div className='mb-3 text-sm text-gray-600 italic p-2 bg-gray-50 rounded-lg border-l-4 border-yellow-300'>
              "
              {data.summary.length > 120
                ? data.summary.substring(0, 120) + '...'
                : data.summary}
              "
            </div>
          )}

          {/* Card de Empresa - visão do candidato */}
          {userRole === 'CANDIDATE' && (
            <div className='space-y-3'>
              {/* Áreas de contratação */}
              {data.hiringAreas && data.hiringAreas.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Áreas de Contratação
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {[...data.hiringAreas]
                      .sort((a, b) => a.localeCompare(b))
                      .map((area, index) => (
                        <span
                          key={index}
                          className='bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-sm font-medium'
                        >
                          {area}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Tecnologias */}
              {data.stack.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Tecnologias
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {[...data.stack]
                      .sort((a, b) => a.localeCompare(b))
                      .map((tech, index) => (
                        <span
                          key={index}
                          className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm font-medium'
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Benefícios */}
              {data.benefits.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Benefícios
                  </h3>
                  <div className='grid grid-cols-3 gap-x-4 gap-y-1'>
                    {[...data.benefits]
                      .sort((a, b) => a.localeCompare(b))
                      .map((benefit, index) => (
                        <div
                          key={index}
                          className='flex items-center text-sm text-gray-700 whitespace-nowrap'
                        >
                          <span>{benefit}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Informações da empresa em cards */}
              <div className='grid grid-cols-3 gap-2 mt-3'>
                <div className='p-2.5 text-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'>
                  <h4 className='text-xs text-gray-600 mt-0.5'>Porte</h4>
                  <p className='text-sm text-gray-800 font-medium'>
                    {data.companySize}
                  </p>
                </div>

                <div className='p-2.5 text-center rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 shadow-sm'>
                  <h4 className='text-xs text-gray-600 mt-0.5'>Modelo</h4>
                  <p className='text-sm text-gray-800 font-medium'>
                    {data.workModel}
                  </p>
                </div>

                <div className='p-2.5 text-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm'>
                  <h4 className='text-xs text-gray-600 mt-0.5'>Salário</h4>
                  <p className='text-sm text-gray-800 font-medium'>
                    {data.salary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card de Candidato - visão da empresa */}
          {userRole === 'COMPANY' && (
            <div className='space-y-3'>
              {/* Qualificações (formação acadêmica) */}
              {data.benefits.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Formação acadêmica
                  </h3>
                  <div className='space-y-1'>
                    {/* Formata "Superior Incompleto - curso" para economizar espaço */}
                    {data.benefits
                      .map((qualification, index) => {
                        // Identificar formação e curso para combinar
                        let formattedText = qualification;

                        // Verifica se é a qualificação da formação
                        if (qualification.startsWith('Formação:')) {
                          const education = qualification.replace(
                            'Formação: ',
                            ''
                          );

                          // Verifica se a próxima qualificação é um curso
                          if (
                            data.benefits.length > index + 1 &&
                            data.benefits[index + 1].startsWith('Curso:')
                          ) {
                            const course = data.benefits[index + 1].replace(
                              'Curso: ',
                              ''
                            );
                            formattedText = `${education} - ${course}`;

                            // Pula o próximo item (curso) na próxima iteração
                            if (index === 0 && data.benefits.length > 1) {
                              return (
                                <div
                                  key={index}
                                  className='flex items-start gap-1 text-sm text-gray-700'
                                >
                                  <span>{formattedText}</span>
                                </div>
                              );
                            } else {
                              return null; // Se não for o primeiro item, não renderiza nada
                            }
                          } else {
                            // Não há curso associado, mostra apenas a formação
                            formattedText = education;
                          }
                        } else if (qualification.startsWith('Curso:')) {
                          // Já foi processado junto com a formação
                          return null;
                        }

                        return (
                          <div
                            key={index}
                            className='flex items-start gap-1 text-sm text-gray-700'
                          >
                            <span>{formattedText}</span>
                          </div>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                </div>
              )}

              {/* Habilidades principais */}
              {data.stack.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Habilidades Principais
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {[...data.stack]
                      .sort((a, b) => a.localeCompare(b))
                      .map((tech, index) => (
                        <span
                          key={index}
                          className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm font-medium'
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {data.languages && data.languages.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-1.5'>
                    Idiomas
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {[...data.languages]
                      .sort((a, b) => a.localeCompare(b))
                      .map((language, index) => {
                        // Determina a cor do badge com base no nível de proficiência
                        let bgColor = 'bg-gray-100';
                        let textColor = 'text-gray-700';

                        if (language.includes('nativo')) {
                          bgColor = 'bg-purple-100';
                          textColor = 'text-purple-700';
                        } else if (language.includes('fluente')) {
                          bgColor = 'bg-indigo-100';
                          textColor = 'text-indigo-700';
                        } else if (language.includes('avançado')) {
                          bgColor = 'bg-blue-100';
                          textColor = 'text-blue-700';
                        } else if (language.includes('intermediário')) {
                          bgColor = 'bg-teal-100';
                          textColor = 'text-teal-700';
                        } else if (language.includes('básico')) {
                          bgColor = 'bg-green-100';
                          textColor = 'text-green-700';
                        }

                        return (
                          <span
                            key={index}
                            className={`${bgColor} ${textColor} px-2 py-0.5 rounded-full text-sm font-medium`}
                          >
                            {language}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Experiência, Disponibilidade, Pretensão - blocos compactos, mesma cor */}
              <div className='grid grid-cols-3 gap-1 mt-2 w-full'>
                <div className='bg-blue-50 rounded p-2 text-center'>
                  <div className='text-xs font-semibold text-gray-700'>
                    Experiência
                  </div>
                  <div className='text-sm font-medium'>{data.companySize}</div>
                </div>
                <div className='bg-blue-50 rounded p-2 text-center'>
                  <div className='text-xs font-semibold text-gray-700'>
                    Disponibilidade
                  </div>
                  <div className='text-sm font-medium'>{data.workModel}</div>
                </div>
                <div className='bg-blue-50 rounded p-2 text-center'>
                  <div className='text-xs font-semibold text-gray-700'>
                    Pretensão
                  </div>
                  <div className='text-sm font-medium'>{data.salary}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
