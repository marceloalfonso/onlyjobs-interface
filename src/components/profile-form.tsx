'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import {
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  FileText,
  Plus,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { isUserSignedIn } from '../utils/auth';
import { Skill, User } from '../utils/types';

const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  birthDate: z.date().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const predefinedSkills = [
  'Agile',
  'AWS',
  'C#',
  'Docker',
  'Excel',
  'Git',
  'Java',
  'JavaScript',
  'Node.js',
  'PHP',
  'Project Management',
  'Python',
  'React',
  'Scrum',
  'SQL',
  'TypeScript',
  'UI/UX Design',
];

const languages = [{ value: 'pt-BR', label: 'Português (Brasil)' }];

async function getUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: {
        Authorization: token,
      },
    });

    const { message, ...user } = await response.json();

    if (!response.ok) {
      throw new Error(message);
    }

    return user;
  } catch (err) {
    return null;
  }
}

export const ProfileForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profileImageSrc, setProfileImageSrc] = useState<string | undefined>(
    undefined
  );
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  async function updateUserProfile(formData: ProfileFormData) {
    setIsLoading(true);
    setSuccessMessage('');
    setError('');

    try {
      if (!token) {
        throw new Error('Você precisa estar logado para atualizar seu perfil');
      }

      // Prepara apenas os dados que foram preenchidos
      const updatedProfile: Record<string, any> = {};

      // Adiciona o telefone apenas se tiver sido preenchido
      if (formData.phone !== undefined && formData.phone !== '') {
        updatedProfile.phone = formData.phone;
      }

      // Adiciona a data de nascimento apenas se tiver sido preenchida
      if (formData.birthDate) {
        updatedProfile.birthDate = formData.birthDate;
      }

      // Incluir skills se existirem
      if (
        user?.profile?.skills &&
        Array.isArray(user.profile.skills) &&
        user.profile.skills.length > 0
      ) {
        updatedProfile.skills = user.profile.skills;
      }

      // Incluir avatar se existir
      if (user?.profile?.avatarUrl && user.profile.avatarUrl !== '') {
        updatedProfile.avatarUrl = user.profile.avatarUrl;
      }

      // Incluir currículo se existir
      if (user?.profile?.resume) {
        updatedProfile.resume = user.profile.resume;
      }

      // Incluir certificações se existirem
      if (
        user?.profile?.certifications &&
        Array.isArray(user.profile.certifications) &&
        user.profile.certifications.length > 0
      ) {
        updatedProfile.certifications = user.profile.certifications;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: 'PATCH',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile: updatedProfile }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar o perfil.');
      }

      setSuccessMessage('Perfil atualizado com sucesso!');

      // Recarrega os dados do perfil atualizados
      const updatedUser = await getUser(token);
      if (updatedUser) {
        setUser(updatedUser);

        // Atualiza os dados do usuário no armazenamento local/sessão
        const storage = localStorage.getItem('token')
          ? localStorage
          : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));
      }

      // Limpa mensagens após 5 segundos
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao atualizar o perfil. Tente novamente mais tarde.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
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

  // Carrega os dados do perfil do usuário ao iniciar
  useEffect(() => {
    const fetchProfileData = async () => {
      if (shouldRedirect || !token) return;

      setIsLoading(true);
      setError('');
      setConnectionError(false);

      try {
        const userData = await getUser(token);
        if (userData) {
          setUser(userData);
          setProfileImageSrc(userData.avatarUrl);

          // Preenche o formulário com os dados do perfil
          // Importante: usar form.setValue para garantir que os inputs exibam os valores
          setValue('name', userData.name || '');
          setValue('email', userData.email || '');

          // Agora acessa o telefone através de userData.profile.phone
          if (userData.profile?.phone) {
            setValue('phone', userData.profile.phone);
          }

          // Acessa a data de nascimento através de userData.profile
          if (userData.profile?.birthDate) {
            const birthDate = new Date(userData.profile.birthDate);
            setBirthDate(birthDate);
            setValue('birthDate', birthDate);
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar perfil:', error);

        // Verifica se é um erro de conexão
        if (
          error.message &&
          (error.message.includes('Failed to fetch') ||
            error.message.includes('tempo limite') ||
            error.message.includes('network') ||
            error.message.includes('conexão'))
        ) {
          setConnectionError(true);
          setError(
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
          );
        } else {
          setError(
            error.message ||
              'Não foi possível carregar os dados do perfil. Tente novamente mais tarde.'
          );

          // Se for erro de autenticação, redireciona para login
          if (
            error.message &&
            (error.message.includes('logado') ||
              error.message.includes('autenticação') ||
              error.message.includes('sessão'))
          ) {
            setShouldRedirect(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [shouldRedirect, setValue, token]);

  // Função para tentar novamente a conexão
  const handleRetry = () => {
    setConnectionError(false);
    setError('');
    setIsLoading(true);

    // Tenta buscar os dados novamente após um pequeno atraso
    setTimeout(() => {
      const fetchProfileData = async () => {
        try {
          if (!token) {
            setShouldRedirect(true);
            return;
          }

          const userData = await getUser(token);
          if (userData) {
            setUser(userData);
            setIsLoading(false);
            setProfileImageSrc(userData.avatarUrl);

            // Preenche o formulário com os dados do perfil
            reset({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',

              birthDate: userData.birthDate
                ? new Date(userData.birthDate)
                : null,
            });

            if (userData.birthDate) {
              setBirthDate(new Date(userData.birthDate));
            }
          }
        } catch (error: any) {
          console.error('Erro ao tentar novamente:', error);
          setError(
            error.message ||
              'Falha ao conectar novamente. Verifique sua conexão.'
          );
          setConnectionError(true);
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }, 1000);
  };

  // Manipuladores para os campos personalizados que não são controlados pelo React Hook Form
  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date || null);
    setValue('birthDate', date || null);
  };

  const handleProfilePictureChange = (file: File) => {
    setProfilePicture(file);

    // Preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfileImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setUser((prev: User | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...(prev.profile || {}),
            resume: files[0],
          },
        };
      });
    }
  };

  const handleCertificationUpload = (files: FileList | null) => {
    if (files) {
      const newCertifications = Array.from(files);
      setUser((prev: User | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...(prev.profile || {}),
            certifications: [
              ...(prev.profile?.certifications || []),
              ...newCertifications,
            ],
          },
        };
      });
    }
  };

  const removeResume = () => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          resume: null,
        },
      };
    });
  };

  const removeCertification = (index?: number) => {
    if (index === undefined) return;

    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          certifications:
            prev.profile?.certifications?.filter(
              (_: File, i: number) => i !== index
            ) || [],
        },
      };
    });
  };

  const handleSkillChange = (updatedSkills: Skill[]) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          skills: updatedSkills,
        },
      };
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    // Aqui você pode adicionar lógica para alterar o idioma da aplicação
  };

  // Componente de TextField reutilizável
  const TextField = ({
    id,
    label,
    type = 'text',
    placeholder = '',
    required = false,
  }: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => {
    return (
      <div className='mb-4'>
        <label
          htmlFor={id}
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          {label}
        </label>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          {...register(id as any)}
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
        />
        {errors[id as keyof ProfileFormData] && (
          <p className='mt-1 text-xs text-red-600'>
            {errors[id as keyof ProfileFormData]?.message as string}
          </p>
        )}
      </div>
    );
  };

  // Componente de FileUpload reutilizável
  const FileUpload = ({
    id,
    label,
    acceptedFormats,
    helpText,
    icon,
    onFileSelect,
    selectedFile,
    selectedFiles,
    onRemove,
    multiple = false,
  }: {
    id: string;
    label: string;
    acceptedFormats: string;
    helpText: string;
    icon: React.ReactNode;
    onFileSelect: (files: FileList | null) => void;
    selectedFile?: File | null;
    selectedFiles?: File[];
    onRemove: (index?: number) => void;
    multiple?: boolean;
  }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect(e.target.files);
    };

    return (
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
        <div className='mt-1'>
          <label
            htmlFor={id}
            className='flex justify-center items-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer transition-colors'
          >
            <div className='space-y-1 text-center'>
              {icon}
              <div className='text-sm text-gray-600'>
                <p className='pl-1'>{helpText}</p>
              </div>
            </div>
            <input
              id={id}
              type='file'
              accept={acceptedFormats}
              onChange={handleFileChange}
              className='sr-only'
              multiple={multiple}
            />
          </label>
        </div>

        {/* Mostrar arquivo único selecionado */}
        {selectedFile && !multiple && (
          <div className='mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-md'>
            <div className='flex items-center'>
              <FileText size={16} className='text-gray-500 mr-2' />
              <span className='text-sm text-gray-900 truncate'>
                {selectedFile.name}
              </span>
            </div>
            <button
              type='button'
              onClick={() => onRemove()}
              className='text-red-500 hover:text-red-700 transition-colors'
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Mostrar múltiplos arquivos selecionados */}
        {multiple && selectedFiles && selectedFiles.length > 0 && (
          <div className='mt-2 space-y-2'>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-2 bg-gray-50 rounded-md'
              >
                <div className='flex items-center'>
                  <FileText size={16} className='text-gray-500 mr-2' />
                  <span className='text-sm text-gray-900 truncate'>
                    {file.name}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => onRemove(index)}
                  className='text-red-500 hover:text-red-700 transition-colors'
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente SkillSelector reutilizável
  const SkillSelector = ({
    skills,
    onChange,
    availableSkills,
  }: {
    skills: Skill[];
    onChange: (skills: Skill[]) => void;
    availableSkills: string[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAddSkill = (skillName: string) => {
      if (skills.length >= 20) return; // Limite máximo de habilidades

      const newSkill: Skill = {
        id: Math.random().toString(36).substr(2, 9),
        name: skillName,
        isPriority: skills.length < 5, // Primeiras 5 habilidades são prioritárias
      };

      onChange([...skills, newSkill]);
      setIsOpen(false);
    };

    const handleRemoveSkill = (skillId: string) => {
      const newSkills = skills.filter((skill) => skill.id !== skillId);
      // Reajusta as prioridades após remover uma habilidade
      const updatedSkills = newSkills.map((skill, index) => ({
        ...skill,
        isPriority: index < 5,
      }));
      onChange(updatedSkills);
    };

    const unusedSkills = availableSkills.filter(
      (skill) => !skills.some((s) => s.name === skill)
    );

    return (
      <div className='mt-4'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Habilidades
        </label>

        <div className='relative'>
          {/* Selected Skills */}
          <div className='flex flex-wrap gap-2 mb-2'>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  skill.isPriority
                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400/30'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {skill.name}
                <button
                  type='button'
                  onClick={() => handleRemoveSkill(skill.id)}
                  className='ml-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors'
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Button and Dropdown */}
          {unusedSkills.length > 0 && (
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
              >
                <Plus size={18} />
                Adicionar Habilidade
              </button>

              {/* Skills Dropdown */}
              {isOpen && (
                <div className='absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto divide-y divide-gray-100'>
                  {unusedSkills.map((skill) => (
                    <button
                      key={skill}
                      type='button'
                      onClick={() => handleAddSkill(skill)}
                      className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente ProfilePicture reutilizável
  const ProfilePicture = ({
    src,
    alt,
    onImageChange,
  }: {
    src?: string;
    alt: string;
    onImageChange?: (file: File) => void;
  }) => {
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

  // Componente de LanguageSelector reutilizável
  const LanguageSelector = () => {
    return (
      <div className='py-2 px-4 rounded-md bg-gray-200'>
        <label
          htmlFor='language'
          className='block font-medium text-gray-800 mb-1'
        >
          Idioma
        </label>
        <div className='relative'>
          <select
            id='language'
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className='w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value} className='py-2'>
                {lang.label}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin'></div>
          <p className='text-lg text-gray-700'>Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  // Componente principal
  return (
    <div className='min-h-screen p-4 pt-20 text-gray-900 transition-colors bg-gray-100 sm:p-6 sm:pt-24'>
      <div className='max-w-6xl mx-auto'>
        {connectionError && (
          <div className='p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-6'>
            <div className='flex'>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-yellow-800'>
                  Problema de conexão
                </h3>
                <div className='mt-2 text-sm text-yellow-700'>
                  <p>{error}</p>
                </div>
                <div className='mt-4'>
                  <div className='-mx-2 -my-1.5 flex'>
                    <button
                      type='button'
                      onClick={handleRetry}
                      className='bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100'
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {/* Left Column - User Profile & App Settings */}
          <div className='md:col-span-1'>
            <div className='p-6 mb-6 transition-colors bg-white rounded-lg shadow'>
              <ProfilePicture
                src={profileImageSrc}
                alt='Foto de Perfil'
                onImageChange={handleProfilePictureChange}
              />
              <h2 className='mt-4 mb-2 text-xl font-bold text-center'>
                {user?.name || 'Seu Nome'}
              </h2>
              <p className='text-center text-gray-600'>{user?.email}</p>
            </div>

            <div className='p-6 transition-colors bg-white rounded-lg shadow'>
              <h2 className='mb-4 text-xl font-bold'>
                Configurações do Aplicativo
              </h2>
              <div className='space-y-4'>
                <LanguageSelector />
              </div>
            </div>
          </div>

          {/* Right Column - User Data Form */}
          <div className='md:col-span-2'>
            <div className='p-6 transition-colors bg-white rounded-lg shadow'>
              <h2 className='mb-6 text-xl font-bold'>Dados do usuário</h2>

              {successMessage && (
                <div className='px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded'>
                  {successMessage}
                </div>
              )}

              {error && !connectionError && (
                <div className='px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded'>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(updateUserProfile)}>
                <TextField id='name' label='Nome completo' required />

                <TextField
                  id='email'
                  label='Email'
                  required
                  type='email'
                  placeholder='exemplo@email.com'
                />

                <div className='mb-4'>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Celular
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    placeholder='(00) 00000-0000'
                    defaultValue={user?.profile?.phone || ''}
                    {...register('phone')}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                  />
                  {errors.phone && (
                    <p className='mt-1 text-xs text-red-600'>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className='mb-4'>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>
                    Data de Nascimento
                  </label>
                  <Popover.Root>
                    <div className='relative'>
                      <input
                        type='text'
                        value={birthDate ? format(birthDate, 'dd/MM/yyyy') : ''}
                        readOnly
                        className='w-full px-3 py-2 text-gray-900 transition-colors bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='DD/MM/AAAA'
                      />
                      <Popover.Trigger asChild>
                        <button
                          type='button'
                          className='absolute text-gray-500 -translate-y-1/2 right-2 top-1/2 hover:text-gray-700'
                        >
                          <Calendar size={20} />
                        </button>
                      </Popover.Trigger>
                    </div>
                    <Popover.Portal>
                      <Popover.Content className='z-50 p-2 bg-white rounded-lg shadow-lg'>
                        <DayPicker
                          mode='single'
                          selected={birthDate || undefined}
                          onSelect={handleDateSelect}
                          className='border-none'
                        />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>

                <FileUpload
                  id='resume'
                  label='Currículo'
                  acceptedFormats='.pdf,.doc,.docx'
                  helpText='Clique para selecionar um arquivo PDF, DOC ou DOCX'
                  icon={<FileText className='w-10 h-10 text-gray-400' />}
                  onFileSelect={handleResumeUpload}
                  selectedFile={user?.profile?.resume}
                  onRemove={removeResume}
                  multiple={false}
                />

                <FileUpload
                  id='certifications'
                  label='Certificações'
                  acceptedFormats='.pdf,.jpg,.jpeg,.png'
                  multiple
                  helpText='Clique para adicionar certificação (PDF, JPG, JPEG, PNG)'
                  icon={<CheckCircle className='w-10 h-10 text-gray-400' />}
                  onFileSelect={handleCertificationUpload}
                  selectedFiles={user?.profile?.certifications}
                  onRemove={removeCertification}
                />

                <SkillSelector
                  skills={user?.profile?.skills || []}
                  onChange={handleSkillChange}
                  availableSkills={predefinedSkills}
                />

                <div className='mt-6'>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full px-4 py-3 font-medium text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed'
                  >
                    {isLoading ? (
                      <>
                        <span className='inline-block w-4 h-4 mr-2 align-middle border-2 border-white rounded-full border-t-transparent animate-spin'></span>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
