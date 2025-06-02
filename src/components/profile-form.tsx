'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar, LogOut, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { isUserSignedIn, logout } from '../utils/auth';
import {
  availabilityOptions,
  benefitsOptions,
  companySizeOptions,
  companyTechnologiesOptions,
  educationOptions,
  experienceOptions,
  higherEducationLevels,
  hiringAreasOptions,
  industrySectorOptions,
  predefinedSkills,
  seniorityOptions,
  workModelOptions,
  workScheduleOptions,
} from '../utils/constants';
import { LanguageSkill, Skill, User } from '../utils/types';
import { LanguageSkillSelector } from './language-skill-selector';
import { MultiSelectField } from './multi-select-field';
import { ProfilePicture } from './profile-picture';
import { SelectField } from './select-field';
import { SkillSelector } from './skill-selector';
import { TextField } from './text-field';

const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  picture: z.string().optional(),
  birthDate: z.date().nullable().optional(),
  location: z.string().optional(),
  summary: z
    .string()
    .max(150, 'O resumo deve ter no máximo 150 caracteres')
    .optional(),

  // Campos específicos para candidatos
  education: z.string().optional(),
  course: z.string().optional(), // Novo campo para o curso da formação acadêmica
  experienceYears: z.string().optional(),
  seniority: z.string().optional(),
  availability: z.string().optional(),
  expectedSalary: z.string().optional(),

  // Campos específicos para empresas
  industrySector: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
  workModel: z.string().optional(),
  workSchedule: z.string().optional(), // Campo de jornada de trabalho
  benefits: z.array(z.string()).optional(),
  hiringAreas: z.array(z.string()).optional(),
  companyTechnologies: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profileImageSrc, setProfileImageSrc] = useState<string | undefined>(
    undefined
  );
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  // Adicionando estado para controlar a exibição do campo de curso
  const [showCourseField, setShowCourseField] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  // Observa mudanças no campo de educação para mostrar/esconder o campo de curso
  const currentEducation = watch('education');

  // Efeito para atualizar a exibição do campo de curso
  useEffect(() => {
    const isHigherEducation = higherEducationLevels.includes(
      currentEducation || ''
    );
    setShowCourseField(isHigherEducation);
  }, [currentEducation]);

  // Função de logout
  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

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

      // Adiciona campos comuns que existem tanto para candidatos quanto empresas
      if (formData.birthDate) {
        updatedProfile.birthDate = formData.birthDate;
      }

      if (formData.location) {
        updatedProfile.location = formData.location;
      }

      if (formData.summary) {
        updatedProfile.summary = formData.summary;
      }

      // Adiciona campos específicos para candidatos
      if (user?.role === 'CANDIDATE') {
        if (formData.education) {
          updatedProfile.education = formData.education;
        }

        // Adiciona o curso apenas se for uma formação superior e o campo estiver preenchido
        if (
          higherEducationLevels.includes(formData.education || '') &&
          formData.course
        ) {
          updatedProfile.course = formData.course;
        }

        if (formData.experienceYears) {
          updatedProfile.experienceYears = formData.experienceYears;
        }

        if (formData.seniority) {
          updatedProfile.seniority = formData.seniority;
        }

        if (formData.availability) {
          updatedProfile.availability = formData.availability;
        }

        if (formData.expectedSalary) {
          updatedProfile.expectedSalary = formData.expectedSalary;
        }
      }

      // Adiciona campos específicos para empresas
      else if (user?.role === 'COMPANY') {
        if (formData.industrySector) {
          updatedProfile.industrySector = formData.industrySector;
        }

        if (formData.companySize) {
          updatedProfile.companySize = formData.companySize;
        }

        if (formData.website) {
          updatedProfile.website = formData.website;
        }

        if (formData.workModel) {
          updatedProfile.workModel = formData.workModel;
        }

        if (formData.workSchedule) {
          updatedProfile.workSchedule = formData.workSchedule;
        }

        // Incluir áreas de contratação se existirem
        if (
          user?.profile?.hiringAreas &&
          Array.isArray(user.profile.hiringAreas) &&
          user.profile.hiringAreas.length > 0
        ) {
          updatedProfile.hiringAreas = user.profile.hiringAreas;
        }

        // Incluir tecnologias utilizadas se existirem
        if (
          user?.profile?.companyTechnologies &&
          Array.isArray(user.profile.companyTechnologies) &&
          user.profile.companyTechnologies.length > 0
        ) {
          updatedProfile.companyTechnologies = user.profile.companyTechnologies;
        }

        // Incluir os benefícios se existirem - apenas para empresas
        if (user?.profile?.benefits && Array.isArray(user.profile.benefits)) {
          updatedProfile.benefits = user.profile.benefits;
        }
      }

      // Incluir skills se existirem
      if (
        user?.profile?.skills &&
        Array.isArray(user.profile.skills) &&
        user.profile.skills.length > 0
      ) {
        updatedProfile.skills = user.profile.skills;
      }

      // Incluir idiomas se existirem
      if (
        user?.profile?.languageSkills &&
        Array.isArray(user.profile.languageSkills) &&
        user.profile.languageSkills.length > 0
      ) {
        updatedProfile.languageSkills = user.profile.languageSkills;
      }

      // Incluir currículo se existir - apenas para candidatos
      if (user?.role === 'CANDIDATE' && user?.profile?.resume) {
        updatedProfile.resume = user.profile.resume;
      }

      // Incluir certificações se existirem - apenas para candidatos
      if (
        user?.role === 'CANDIDATE' &&
        user?.profile?.certifications &&
        Array.isArray(user.profile.certifications) &&
        user.profile.certifications.length > 0
      ) {
        updatedProfile.certifications = user.profile.certifications;
      }

      // Converter imagem de perfil para base64 e incluir em picture
      if (profilePicture) {
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        updatedProfile.picture = await toBase64(profilePicture);
      } else if (user?.profile?.picture) {
        updatedProfile.picture = user.profile.picture;
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
          // Prioriza a foto em base64 salva no profile.picture
          if (userData.profile?.picture) {
            setProfileImageSrc(userData.profile.picture);
          } else {
            setProfileImageSrc(undefined);
          }

          // Preenche o formulário com os dados do perfil
          setValue('name', userData.name || '');
          setValue('email', userData.email || '');
          setValue('location', userData.profile?.location || '');
          setValue('summary', userData.profile?.summary || '');

          // Se for candidato, preenche campos específicos de candidato
          if (userData.role === 'CANDIDATE') {
            const education = userData.profile?.education || '';
            setValue('education', education);
            setValue('course', userData.profile?.course || '');
            setValue(
              'experienceYears',
              userData.profile?.experienceYears || ''
            );
            setValue('seniority', userData.profile?.seniority || '');
            setValue('availability', userData.profile?.availability || '');

            // Define se o campo de curso deve ser exibido inicialmente
            const isHigherEducation = higherEducationLevels.includes(education);
            setShowCourseField(isHigherEducation);
          }
          // Se for empresa, preenche campos específicos de empresa
          else if (userData.role === 'COMPANY') {
            setValue('industrySector', userData.profile?.industrySector || '');
            setValue('companySize', userData.profile?.companySize || '');
            setValue('workModel', userData.profile?.workModel || '');
            setValue('workSchedule', userData.profile?.workSchedule || '');
          }

          if (userData.profile?.birthDate) {
            const birthDate = new Date(userData.profile.birthDate);
            setBirthDate(birthDate);
            setValue('birthDate', birthDate);
          }

          // Adicionando inicialização para o campo de pretensão salarial no carregamento do perfil
          setValue('expectedSalary', userData.profile?.expectedSalary || '');

          // Formata o valor da pretensão salarial se existir
          if (userData.profile?.expectedSalary) {
            setSalaryInputValue(userData.profile.expectedSalary);
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
            // Prioriza a foto em base64 salva no profile.picture
            if (userData.profile?.picture) {
              setProfileImageSrc(userData.profile.picture);
            } else if (userData.avatarUrl) {
              setProfileImageSrc(userData.avatarUrl);
            } else {
              setProfileImageSrc(undefined);
            }

            // Preenche o formulário com os dados do perfil
            reset({
              name: userData.name || '',
              email: userData.email || '',
              birthDate: userData.birthDate
                ? new Date(userData.birthDate)
                : null,
              education: userData.profile?.education || '',
              experienceYears: userData.profile?.experienceYears || '',
              location: userData.profile?.location || '',
              seniority: userData.profile?.seniority || '',
              availability: userData.profile?.availability || '',
              summary: userData.profile?.summary || '',
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

  // Manipuladores para campos específicos de empresas
  const handleBenefitsChange = (selectedBenefits: string[]) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          benefits: selectedBenefits,
        },
      };
    });
  };

  const handleHiringAreasChange = (selectedAreas: string[]) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          hiringAreas: selectedAreas,
        },
      };
    });
  };

  const handleCompanyTechnologiesChange = (selectedTechnologies: string[]) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          companyTechnologies: selectedTechnologies,
        },
      };
    });
  };

  // Manipuladores para os campos personalizados que não são controlados pelo React Hook Form
  const handleDateSelect = (date: Date | undefined) => {
    if (date && isDateInFuture(date)) return;

    setBirthDate(date || null);
    setValue('birthDate', date || null);
  };

  // Função para verificar se uma data está no futuro
  const isDateInFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignora o tempo
    return date > today;
  };

  // Função para formatar a data conforme digitada
  const formatBirthDate = (value: string) => {
    // Remove todos os caracteres não numéricos
    let numbers = value.replace(/\D/g, '');

    // Limita ao máximo de 8 dígitos (DDMMYYYY)
    numbers = numbers.slice(0, 8);

    // Formata conforme digita
    let formattedDate = '';

    if (numbers.length > 0) {
      // Adiciona os dígitos do dia
      formattedDate = numbers.slice(0, 2);

      // Adiciona a primeira barra após os dígitos do dia
      if (numbers.length > 2) {
        formattedDate += '/' + numbers.slice(2, 4);

        // Adiciona a segunda barra e os dígitos do ano
        if (numbers.length > 4) {
          formattedDate += '/' + numbers.slice(4);
        }
      }
    }

    return formattedDate;
  };

  // Função para converter string formatada para objeto Date
  const parseDateString = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês em JavaScript começa em 0
    const year = parseInt(parts[2], 10);

    // Validações básicas
    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      day < 1 ||
      day > 31 ||
      month < 0 ||
      month > 11 ||
      year < 1900 ||
      year > 2100 ||
      parts[2].length !== 4 // Garante que o ano tenha exatamente 4 dígitos
    ) {
      return null;
    }

    const date = new Date(year, month, day);

    // Verifica se a data é válida (ex: 31/02/2023 não é válido)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  // Estado para controlar o input da data formatada
  const [dateInputValue, setDateInputValue] = useState('');
  const [dateError, setDateError] = useState('');

  // Função para lidar com a alteração no input da data
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBirthDate(e.target.value);
    setDateInputValue(formattedValue);
    setDateError('');

    // Limpa a data atual até que uma nova data válida seja inserida
    setBirthDate(null);
    setValue('birthDate', null);

    // Só valida se o valor estiver completo (DD/MM/YYYY)
    if (formattedValue.length === 10) {
      const parsedDate = parseDateString(formattedValue);

      if (parsedDate) {
        if (isDateInFuture(parsedDate)) {
          setDateError('Data não pode ser no futuro');
        } else {
          setBirthDate(parsedDate);
          setValue('birthDate', parsedDate);
        }
      } else {
        setDateError('Data inválida');
      }
    } else if (formattedValue.length > 0) {
      // Mostra mensagem de erro se a data estiver incompleta
      setDateError('Digite a data completa no formato DD/MM/AAAA');
    }
  };

  // Função para excluir conta
  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'deletar') {
      setDeleteError('Digite "deletar" para prosseguir com a exclusão');
      return;
    }

    setIsLoading(true);
    setError('');
    setDeleteError('');
    setSuccessMessage('');

    try {
      if (!token) {
        throw new Error('Você precisa estar logado para excluir sua conta');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir a conta.');
      }

      // Logout após exclusão da conta
      logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao excluir a conta. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
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

  // Estado para controlar erros de validação customizados
  const [formHasErrors, setFormHasErrors] = useState(false);

  // Função para verificar todos os erros do formulário antes da submissão
  const checkFormValidity = () => {
    // Verifica se há erro na data de nascimento
    if (user?.role === 'CANDIDATE' && dateError) {
      return false;
    }
    return true;
  };

  // Manipulador de submit modificado para verificar erros antes de enviar
  const onSubmit = async (formData: ProfileFormData) => {
    // Verifica se o formulário está válido (incluindo validações não capturadas pelo React Hook Form)
    if (!checkFormValidity()) {
      setFormHasErrors(true);
      setError('Por favor, corrija os erros no formulário antes de salvar.');
      return;
    }

    setFormHasErrors(false);
    await updateUserProfile(formData);
  };

  // Estado para controlar o input da pretensão salarial formatada
  const [salaryInputValue, setSalaryInputValue] = useState('');

  // Função para formatar valores monetários
  const formatCurrency = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');

    // Se não houver números, retorna string vazia
    if (!numbers) return '';

    // Converte para número e formata com casas decimais
    const amount = parseFloat(numbers) / 100;

    // Formata com separadores de milhares e casas decimais
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Função para lidar com a alteração no input de salário
  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Limpa o campo completamente se o usuário apagar todo o conteúdo
    if (!rawValue.trim()) {
      setSalaryInputValue('');
      setValue('expectedSalary', '');
      return;
    }

    // Remove formatação para obter apenas os números
    const numericValue = rawValue.replace(/\D/g, '');

    // Formata o valor para exibição
    const formattedValue = numericValue ? formatCurrency(numericValue) : '';

    // Atualiza o estado com o valor formatado
    setSalaryInputValue(formattedValue);

    // Atualiza o valor no formulário (guardando apenas o valor formatado)
    setValue('expectedSalary', formattedValue);
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
          {/* Left Column - User Profile & Basic Info */}
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
              <h2 className='mb-4 text-xl font-bold'>Informações básicas</h2>

              <form>
                <TextField
                  id='name'
                  label='Nome de usuário'
                  required
                  register={register}
                  errors={errors}
                  readOnly={true}
                />

                <TextField
                  id='email'
                  label='Endereço de e-mail'
                  required
                  type='email'
                  placeholder='exemplo@email.com'
                  register={register}
                  errors={errors}
                  readOnly={true}
                />

                <TextField
                  id='location'
                  label='Localização'
                  placeholder='Ex: São Paulo, SP'
                  register={register}
                  errors={errors}
                />

                {/* Website (apenas para empresas) */}
                {user?.role === 'COMPANY' && (
                  <TextField
                    id='website'
                    label='Website'
                    placeholder='https://exemplo.com'
                    register={register}
                    errors={errors}
                    defaultValue={user?.profile?.website}
                  />
                )}

                {/* Data de nascimento - apenas para candidatos */}
                {user?.role === 'CANDIDATE' && (
                  <div className='mb-4'>
                    <label className='block mb-1 text-sm font-medium text-gray-700'>
                      Data de nascimento
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        value={
                          dateInputValue ||
                          (birthDate ? format(birthDate, 'dd/MM/yyyy') : '')
                        }
                        onChange={handleDateInputChange}
                        className='w-full px-3 py-2 text-gray-900 transition-colors bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='DD/MM/AAAA'
                      />
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button
                            type='button'
                            className='absolute text-gray-500 -translate-y-1/2 right-2 top-1/2 hover:text-gray-700'
                          >
                            <Calendar size={20} />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content className='z-50 p-2 bg-white rounded-lg shadow-lg'>
                            <DayPicker
                              mode='single'
                              selected={birthDate || undefined}
                              onSelect={handleDateSelect}
                              className='border-none'
                              disabled={isDateInFuture}
                              fromDate={new Date(1900, 0, 1)}
                              toDate={new Date()}
                            />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                    {dateError && (
                      <p className='mt-1 text-xs text-red-600'>{dateError}</p>
                    )}
                  </div>
                )}

                {/* Botão de logout */}
                <div className='mt-6'>
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='cursor-pointer flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  >
                    <LogOut className='w-5 h-5 mr-2' />
                    Sair da conta
                  </button>
                </div>

                {/* Botão para excluir conta */}
                <div className='mt-4'>
                  <Dialog.Root
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                  >
                    <Dialog.Trigger asChild>
                      <button className='cursor-pointer flex items-center justify-center w-full px-4 py-2 text-base font-medium text-red-700 transition-colors bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        <Trash2 className='w-5 h-5 mr-2' />
                        Excluir conta
                      </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                      <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
                      <Dialog.Content className='fixed inset-0 flex items-center justify-center p-4'>
                        <div className='w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg'>
                          <Dialog.Title className='text-lg font-bold text-gray-900'>
                            Tem certeza que deseja excluir sua conta?
                          </Dialog.Title>
                          <Dialog.Description className='mt-2 text-sm text-gray-600'>
                            Esta ação é irreversível e apagará todos os seus
                            dados.
                          </Dialog.Description>

                          <div className='mt-4'>
                            <label
                              htmlFor='delete-confirmation'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Para confirmar, digite "deletar" no campo abaixo:
                            </label>
                            <input
                              type='text'
                              id='delete-confirmation'
                              value={deleteConfirmation}
                              onChange={(e) =>
                                setDeleteConfirmation(e.target.value)
                              }
                              className='w-full px-3 py-2 text-gray-900 transition-colors bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500'
                              placeholder='deletar'
                            />
                            {deleteError && (
                              <p className='mt-1 text-xs text-red-600'>
                                {deleteError}
                              </p>
                            )}
                          </div>

                          <div className='flex justify-end mt-4'>
                            <Dialog.Close asChild>
                              <button className='px-4 py-2 mr-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                                Cancelar
                              </button>
                            </Dialog.Close>
                            <button
                              onClick={handleDeleteAccount}
                              className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                            >
                              {isLoading ? (
                                <>
                                  <span className='inline-block w-4 h-4 mr-2 align-middle border-2 border-white rounded-full border-t-transparent animate-spin'></span>
                                  <span>Excluindo...</span>
                                </>
                              ) : (
                                'Excluir conta'
                              )}
                            </button>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - User Professional Data Form */}
          <div className='md:col-span-2'>
            <div className='p-6 transition-colors bg-white rounded-lg shadow'>
              <h2 className='mb-6 text-xl font-bold'>
                Informações complementares
              </h2>

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

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Renderização condicional com base no tipo de conta */}
                {user?.role === 'CANDIDATE' ? (
                  // Campos específicos para candidatos
                  <>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <SelectField
                        id='education'
                        label='Formação acadêmica'
                        options={educationOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.education}
                        onChange={(e) => {
                          const educationValue = e.target.value;
                          setValue('education', educationValue);
                          const isHigherEducation =
                            higherEducationLevels.includes(educationValue);
                          setShowCourseField(isHigherEducation);

                          if (!isHigherEducation) {
                            setValue('course', '');
                          }
                        }}
                      />

                      <SelectField
                        id='experienceYears'
                        label='Experiência profissional'
                        options={experienceOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.experienceYears}
                      />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <SelectField
                        id='seniority'
                        label='Nível de senioridade'
                        options={seniorityOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.seniority}
                      />

                      <SelectField
                        id='availability'
                        label='Disponibilidade'
                        options={availabilityOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.availability}
                      />
                    </div>

                    {/* Pretensão salarial para candidatos */}
                    <div
                      className={`grid grid-cols-1 gap-4 ${
                        showCourseField ? 'md:grid-cols-2' : ''
                      }`}
                    >
                      <div className='mb-4'>
                        <label
                          htmlFor='expectedSalary'
                          className='block mb-1 text-sm font-medium text-gray-700'
                        >
                          Pretensão salarial
                        </label>
                        <input
                          type='text'
                          id='expectedSalary'
                          value={
                            salaryInputValue ||
                            user?.profile?.expectedSalary ||
                            ''
                          }
                          onChange={handleSalaryInputChange}
                          placeholder='Ex: R$ 5.000,00'
                          className='w-full px-3 py-2 text-gray-900 transition-colors bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>

                      {/* Campo de curso condicionalmente exibido para formações superiores */}
                      {showCourseField && (
                        <TextField
                          id='course'
                          label='Curso'
                          placeholder='Ex: Ciência da Computação'
                          register={register}
                          errors={errors}
                          defaultValue={user?.profile?.course}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  // Campos específicos para empresas
                  <>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <SelectField
                        id='industrySector'
                        label='Setor de atuação'
                        options={industrySectorOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.industrySector}
                      />

                      <SelectField
                        id='companySize'
                        label='Porte'
                        options={companySizeOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.companySize}
                      />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <SelectField
                        id='workModel'
                        label='Modelo de trabalho'
                        options={workModelOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.workModel}
                      />

                      <SelectField
                        id='workSchedule'
                        label='Jornada de trabalho'
                        options={workScheduleOptions}
                        register={register}
                        errors={errors}
                        defaultValue={user?.profile?.workSchedule}
                      />
                    </div>

                    <MultiSelectField
                      id='benefits'
                      label='Benefícios oferecidos'
                      options={benefitsOptions}
                      defaultValue={user?.profile?.benefits || []}
                      onChange={handleBenefitsChange}
                      helpText='Selecione os benefícios que sua empresa oferece'
                    />
                  </>
                )}

                <div className='mb-4'>
                  <label
                    htmlFor='summary'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    {user?.role === 'CANDIDATE'
                      ? 'Resumo profissional'
                      : 'Sobre a empresa'}{' '}
                    <span className='text-xs text-gray-500'>
                      (máx. 150 caracteres)
                    </span>
                  </label>
                  <textarea
                    id='summary'
                    {...register('summary')}
                    rows={3}
                    maxLength={150}
                    placeholder={
                      user?.role === 'CANDIDATE'
                        ? 'Breve descrição sobre você, suas habilidades e objetivos profissionais'
                        : 'Breve descrição sobre sua empresa, cultura e valores'
                    }
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                    defaultValue={user?.profile?.summary || ''}
                  />
                  {errors.summary && (
                    <p className='mt-1 text-xs text-red-600'>
                      {errors.summary.message}
                    </p>
                  )}
                </div>

                {/* Campos específicos por tipo de usuário */}
                {user?.role === 'CANDIDATE' ? (
                  <>
                    {/* Campos exclusivos para candidatos */}
                    <LanguageSkillSelector
                      languageSkills={user?.profile?.languageSkills || []}
                      onChange={(updatedLanguages: LanguageSkill[]) => {
                        setUser((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            profile: {
                              ...(prev.profile || {}),
                              languageSkills: updatedLanguages,
                            },
                          };
                        });
                      }}
                    />

                    <SkillSelector
                      skills={user?.profile?.skills || []}
                      onChange={handleSkillChange}
                      availableSkills={predefinedSkills}
                    />
                  </>
                ) : (
                  <>
                    {/* Campos exclusivos para empresas */}
                    <MultiSelectField
                      id='hiringAreas'
                      label='Áreas em contratação'
                      options={hiringAreasOptions}
                      defaultValue={user?.profile?.hiringAreas || []}
                      onChange={handleHiringAreasChange}
                      helpText='Selecione as áreas em que sua empresa está contratando'
                    />

                    <MultiSelectField
                      id='companyTechnologies'
                      label='Tecnologias mais usadas'
                      options={companyTechnologiesOptions}
                      defaultValue={user?.profile?.companyTechnologies || []}
                      onChange={handleCompanyTechnologiesChange}
                      helpText='Selecione as principais tecnologias utilizadas na empresa'
                    />
                  </>
                )}

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
                      'Salvar alterações'
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
