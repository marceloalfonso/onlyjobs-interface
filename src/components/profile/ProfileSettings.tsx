'use client';

import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar, CheckCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import {
  getUserProfile,
  updateUserProfile,
  uploadCertifications,
  uploadProfilePicture,
  uploadResume,
} from '../../services/profileService';
import { isUserSignedIn } from '../../utils/auth';
import { Skill, UserProfile } from '../../utils/types';
import FileUpload from './FileUpload';
import LanguageSelector from './LanguageSelector';
import ProfilePicture from './ProfilePicture';
import SkillSelector from './SkillSelector';
import TextField from './TextField';
import ThemeToggle from './ThemeToggle';

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

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [userData, setUserData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: null,
    birthDate: null,
    resume: null,
    certifications: [],
    skills: [],
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Verifica se o usuário está autenticado
  useEffect(() => {
    if (!isUserSignedIn()) {
      setShouldRedirect(true);
      return;
    }
  }, []);

  // Redirecionamento para a página de login se não estiver autenticado
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/sign-in');
    }
  }, [shouldRedirect, router]);

  // Carrega os dados do perfil do usuário ao iniciar
  useEffect(() => {
    const fetchProfileData = async () => {
      if (shouldRedirect) return;

      setIsLoading(true);
      setErrorMessage('');
      setConnectionError(false);

      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserData(profile);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);

        // Verifica se é um erro de conexão
        if (
          error.message &&
          (error.message.includes('Failed to fetch') ||
            error.message.includes('tempo limite') ||
            error.message.includes('network') ||
            error.message.includes('conexão'))
        ) {
          setConnectionError(true);
          setErrorMessage(
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
          );
        } else {
          setErrorMessage(
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
  }, [shouldRedirect]);

  // Função para tentar novamente a conexão
  const handleRetry = () => {
    setConnectionError(false);
    setErrorMessage('');
    setIsLoading(true);

    // Tenta buscar os dados novamente após um pequeno atraso
    setTimeout(() => {
      const fetchProfileData = async () => {
        try {
          const profile = await getUserProfile();
          if (profile) {
            setUserData(profile);
            setIsLoading(false);
          }
        } catch (error: any) {
          console.error('Error on retry:', error);
          setErrorMessage(
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setUserData((prev) => ({
      ...prev,
      birthDate: date || null,
    }));
  };

  const handleProfilePictureChange = (file: File) => {
    setProfilePicture(file);
  };

  const handleResumeUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setUserData((prev) => ({
        ...prev,
        resume: files[0],
      }));
    }
  };

  const handleCertificationUpload = (files: FileList | null) => {
    if (files) {
      const newCertifications = Array.from(files);
      setUserData((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), ...newCertifications],
      }));
    }
  };

  const removeResume = () => {
    setUserData((prev) => ({
      ...prev,
      resume: null,
    }));
  };

  const removeCertification = (index?: number) => {
    if (index === undefined) return;

    setUserData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSkillChange = (skills: Skill[]) => {
    setUserData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Upload de avatar, se houver
      let avatarUrl;
      if (profilePicture) {
        avatarUrl = await uploadProfilePicture(profilePicture);
      }

      // Upload de currículo, se houver
      let resumeUrl;
      if (userData.resume) {
        resumeUrl = await uploadResume(userData.resume);
      }

      // Upload de certificações, se houver
      let certificationUrls;
      if (userData.certifications && userData.certifications.length > 0) {
        certificationUrls = await uploadCertifications(userData.certifications);
      }

      // Atualiza perfil do usuário
      const success = await updateUserProfile({
        ...userData,
        avatarUrl: avatarUrl || userData.avatarUrl,
      });

      if (success) {
        setSuccessMessage('Perfil atualizado com sucesso!');

        // Recarrega os dados do perfil atualizados
        const updatedProfile = await getUserProfile();
        if (updatedProfile) {
          setUserData(updatedProfile);
        }
      } else {
        throw new Error('Falha ao atualizar o perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(
        'Ocorreu um erro ao atualizar o perfil. Tente novamente mais tarde.'
      );
    } finally {
      setIsSubmitting(false);

      // Limpa mensagens após 5 segundos
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin'></div>
          <p className='text-lg text-gray-700 dark:text-gray-300'>
            Carregando seu perfil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-4 pt-28 text-gray-900 transition-colors bg-gray-100 dark:bg-gray-900 dark:text-gray-100 sm:p-6 sm:pt-32'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {/* Left Column - User Profile & App Settings */}
          <div className='md:col-span-1'>
            <div className='p-6 mb-6 transition-colors bg-white rounded-lg shadow dark:bg-gray-800'>
              <ProfilePicture
                src={userData.avatarUrl}
                alt='Foto de Perfil'
                onImageChange={handleProfilePictureChange}
              />
              <h2 className='mt-4 mb-2 text-xl font-bold text-center'>
                {userData.name || 'Seu Nome'}
              </h2>
              <p className='text-center text-gray-600 dark:text-gray-400'>
                {userData.email}
              </p>
            </div>

            <div className='p-6 transition-colors bg-white rounded-lg shadow dark:bg-gray-800'>
              <h2 className='mb-4 text-xl font-bold'>
                Configurações do Aplicativo
              </h2>
              <div className='space-y-4'>
                <ThemeToggle />
                <LanguageSelector />
              </div>
            </div>
          </div>

          {/* Right Column - User Data Form */}
          <div className='md:col-span-2'>
            <div className='p-6 transition-colors bg-white rounded-lg shadow dark:bg-gray-800'>
              <h2 className='mb-6 text-xl font-bold'>Dados do Usuário</h2>

              {successMessage && (
                <div className='px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'>
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className='px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  id='name'
                  label='Nome Completo'
                  required
                  value={userData.name}
                  onChange={handleChange}
                />

                <TextField
                  id='email'
                  label='Email'
                  required
                  type='email'
                  value={userData.email}
                  onChange={handleChange}
                  placeholder='exemplo@email.com'
                />

                <TextField
                  id='phone'
                  label='Celular'
                  required
                  type='tel'
                  value={userData.phone}
                  onChange={handleChange}
                  placeholder='(00) 00000-0000'
                />

                <div className='mb-4'>
                  <label className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Data de Nascimento
                  </label>
                  <Popover.Root>
                    <div className='relative'>
                      <input
                        type='text'
                        value={
                          userData.birthDate
                            ? format(new Date(userData.birthDate), 'dd/MM/yyyy')
                            : ''
                        }
                        readOnly
                        className='w-full px-3 py-2 text-gray-900 transition-colors bg-white border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:text-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='DD/MM/AAAA'
                      />
                      <Popover.Trigger asChild>
                        <button
                          type='button'
                          className='absolute text-gray-500 -translate-y-1/2 right-2 top-1/2 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        >
                          <Calendar size={20} />
                        </button>
                      </Popover.Trigger>
                    </div>
                    <Popover.Portal>
                      <Popover.Content className='z-50 p-2 bg-white rounded-lg shadow-lg dark:bg-gray-800'>
                        <DayPicker
                          mode='single'
                          selected={
                            userData.birthDate
                              ? new Date(userData.birthDate)
                              : undefined
                          }
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
                  selectedFile={userData.resume}
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
                  selectedFiles={userData.certifications}
                  onRemove={removeCertification}
                />

                <SkillSelector
                  skills={userData.skills || []}
                  onChange={handleSkillChange}
                  availableSkills={predefinedSkills}
                />

                <div className='mt-6'>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full px-4 py-3 font-medium text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? (
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

export default ProfileSettings;
