import { Dispatch, SetStateAction } from 'react';
import { Position } from './types';

export function preventImageDrag(e: React.DragEvent<HTMLImageElement>) {
  e.preventDefault();
  return false;
}

export function handleDragStart(
  e: React.MouseEvent | React.TouchEvent,
  setIsDragging: Dispatch<SetStateAction<boolean>>,
  position: Position,
  setStartPosition: Dispatch<SetStateAction<Position>>
) {
  setIsDragging(true);

  const clientX =
    'clientX' in e
      ? (e as React.MouseEvent).clientX
      : (e as React.TouchEvent).touches[0].clientX;
  const clientY =
    'clientY' in e
      ? (e as React.MouseEvent).clientY
      : (e as React.TouchEvent).touches[0].clientY;

  setStartPosition({ x: clientX - position.x, y: clientY - position.y });
}

export function handleDragMove(
  e: React.MouseEvent | React.TouchEvent,
  isDragging: boolean,
  startPosition: Position,
  setPosition: Dispatch<SetStateAction<Position>>
) {
  if (!isDragging) return;

  e.preventDefault();

  const clientX =
    'clientX' in e
      ? (e as React.MouseEvent).clientX
      : (e as React.TouchEvent).touches[0].clientX;
  const clientY =
    'clientY' in e
      ? (e as React.MouseEvent).clientY
      : (e as React.TouchEvent).touches[0].clientY;

  const x = clientX - startPosition.x;
  const y = clientY - startPosition.y;

  setPosition({ x, y });
}

export function handleDragEnd(
  setIsDragging: Dispatch<SetStateAction<boolean>>,
  position: Position,
  setPosition: Dispatch<SetStateAction<Position>>,
  onAccept: () => void,
  onReject: () => void
) {
  setIsDragging(false);

  const swipeThreshold = 100;

  if (Math.abs(position.x) > swipeThreshold) {
    if (position.x > 0) {
      onAccept();
    } else {
      onReject();
    }
  }

  setPosition({ x: 0, y: 0 });
}

export function calculateRotation(x: number): number {
  return x / 10;
}

export function calculateScale(x: number): number {
  return Math.max(1 - Math.abs(x) / 1000, 0.9);
}
