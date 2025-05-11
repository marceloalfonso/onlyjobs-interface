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
        className={`bg-white rounded-xl shadow-xl overflow-hidden relative ${
          position.x > 25
            ? 'ring-2 ring-green-400'
            : position.x < -25
            ? 'ring-2 ring-red-400'
            : ''
        }`}
      >
        <div className='relative h-28 md:h-40 bg-gradient-to-r from-blue-50 to-[#e6eeff]'>
          <img
            src='/office-environment.jpg'
            alt='Ambiente de trabalho moderno'
            className='object-cover w-full h-full select-none'
            onDragStart={preventImageDrag}
            draggable='false'
          />
        </div>

        <div className='p-3'>
          <h2 className='mb-1 text-lg font-semibold text-gray-800 md:text-2xl'>
            {mainTitle}
          </h2>

          <div className='flex flex-wrap gap-1 mb-2 md:gap-2 md:mb-4'>
            {data.stack.map((tech, index) => (
              <span
                key={index}
                className='bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full text-xs md:text-sm font-medium'
              >
                {tech}
              </span>
            ))}
          </div>

          <div className='space-y-2 md:space-y-4'>
            <div>
              <h4 className='mb-1 text-xs font-medium text-gray-700 md:text-sm md:mb-2'>
                {userRole === 'CANDIDATE' ? 'Benefícios' : 'Qualificações'}
              </h4>
              <ul className='space-y-0.5 md:space-y-1.5'>
                {data.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className='flex items-center gap-1 text-xs text-gray-600 md:gap-2 md:text-sm'
                  >
                    <i className='text-green-400 fas fa-check'></i>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className='grid grid-cols-3 gap-1 md:gap-3'>
              <div className='text-center'>
                <i className='mb-1 text-base text-gray-400 fas fa-users md:text-xl'></i>
                <h4 className='text-[10px] md:text-xs font-medium text-gray-500 mb-0.5'>
                  {userRole === 'CANDIDATE' ? 'Tamanho' : 'Experiência'}
                </h4>
                <p className='text-[10px] md:text-sm text-gray-600 line-clamp-2'>
                  {data.companySize}
                </p>
              </div>
              <div className='text-center'>
                <i className='mb-1 text-base text-gray-400 fas fa-building md:text-xl'></i>
                <h4 className='text-[10px] md:text-xs font-medium text-gray-500 mb-0.5'>
                  Modelo
                </h4>
                <p className='text-[10px] md:text-sm text-gray-600'>
                  {data.workModel}
                </p>
              </div>
              <div className='text-center'>
                <i className='mb-1 text-base text-gray-400 fas fa-money-bill-wave md:text-xl'></i>
                <h4 className='text-[10px] md:text-xs font-medium text-gray-500 mb-0.5'>
                  Salário
                </h4>
                <p className='text-[10px] md:text-sm text-gray-600'>
                  {data.salary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
