'use client';

import { Camera } from 'lucide-react';
import React, { useState } from 'react';

interface ProfilePictureProps {
  src?: string;
  alt: string;
  onImageChange?: (file: File) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt,
  onImageChange,
}) => {
  const [image, setImage] = useState<string>(
    src ||
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          if (onImageChange) {
            onImageChange(file);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='relative w-36 h-36 mx-auto'>
      <img
        src={image}
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

export default ProfilePicture;
