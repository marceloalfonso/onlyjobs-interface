import { Camera } from 'lucide-react';
import React from 'react';

interface ProfilePictureProps {
  src?: string;
  alt: string;
  onImageChange?: (file: File) => void;
}

export const ProfilePicture = ({
  src,
  alt,
  onImageChange,
}: ProfilePictureProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className='relative w-36 h-36 mx-auto'>
      <img
        src={
          src ||
          'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
        alt={alt}
        className='w-full h-full object-cover rounded-full'
      />
      <label
        htmlFor='profile-picture'
        className='absolute bottom-1 right-1 p-2 rounded-full bg-blue-500 text-white cursor-pointer transition-all hover:bg-blue-600'
      >
        <Camera size={20} />
        <input
          type='file'
          id='profile-picture'
          onChange={handleImageChange}
          className='hidden'
          accept='image/*'
        />
      </label>
    </div>
  );
};
