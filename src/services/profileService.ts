'use client';

import { UserProfile } from '../utils/types';
import { isUserSignedIn } from '../utils/auth';

// Ajustando a URL base da API, verificando também o ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Função auxiliar para depuração
function debugAuthToken() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  console.log('Auth Debug:', { 
    hasToken: !!token, 
    tokenLength: token?.length,
    hasUser: !!user,
    isUserSignedIn: isUserSignedIn(),
    apiUrl: API_URL
  });
  
  return token;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Debug de autenticação
    const token = debugAuthToken();
    
    // Verifica se o usuário está autenticado
    if (!isUserSignedIn()) {
      throw new Error('Você precisa estar logado para acessar esta página');
    }

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Token de autenticação não encontrado');
    }

    console.log('Tentando buscar perfil do usuário, API URL:', API_URL);

    // Testando a conexão com o servidor antes de fazer a requisição principal
    try {
      // Timeout de 5 segundos para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Usando a rota correta /users
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          // O backend espera o token diretamente sem o prefixo "Bearer "
          'Authorization': token
        },
        // Incluindo credenciais para garantir que cookies sejam enviados
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          const responseText = await response.text();
          console.error('Falha de autenticação 401:', responseText);
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Erro ${response.status}: Falha ao buscar dados do perfil`;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dados do perfil recebidos:', data);
      
      // Adaptando o formato de dados da API para o formato esperado pela interface
      const profile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.profile?.phone || '',
        role: data.role,
        birthDate: data.profile?.birthDate ? new Date(data.profile.birthDate) : null,
        avatarUrl: data.profile?.avatarUrl,
        skills: data.profile?.skills || [],
        // Outros campos podem ser adicionados conforme necessário
      };

      return profile;
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Tempo limite excedido ao conectar com o servidor. Verifique sua conexão.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error; // Propaga o erro para ser tratado pelo componente
  }
}

export async function updateUserProfile(userData: Partial<UserProfile>): Promise<boolean> {
  try {
    // Verifica se o usuário está autenticado
    if (!isUserSignedIn()) {
      throw new Error('Você precisa estar logado para atualizar seu perfil');
    }

    // Obtém o token do armazenamento
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return false;
    }

    // Prepara os dados para envio à API
    const profileData = {
      name: userData.name,
      phone: userData.phone,
      birthDate: userData.birthDate,
      skills: userData.skills,
      // Outros dados do perfil conforme necessário
    };

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        // O backend espera o token diretamente sem o prefixo "Bearer "
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Erro de autenticação - limpa os dados do usuário
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erro ${response.status}: Falha ao atualizar perfil`;
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error; // Propaga o erro para ser tratado pelo componente
  }
}

export async function uploadProfilePicture(file: File): Promise<string | null> {
  try {
    // Verifica se o usuário está autenticado
    if (!isUserSignedIn()) {
      throw new Error('Você precisa estar logado para enviar uma foto de perfil');
    }

    // Obtém o token do armazenamento
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        // O backend espera o token diretamente sem o prefixo "Bearer "
        'Authorization': token,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Erro de autenticação - limpa os dados do usuário
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      throw new Error('Failed to upload profile picture');
    }

    const data = await response.json();
    return data.avatarUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
}

export async function uploadResume(file: File): Promise<string | null> {
  try {
    // Verifica se o usuário está autenticado
    if (!isUserSignedIn()) {
      throw new Error('Você precisa estar logado para enviar um currículo');
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_URL}/users/resume`, {
      method: 'POST',
      headers: {
        // O backend espera o token diretamente sem o prefixo "Bearer "
        'Authorization': token,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Erro de autenticação - limpa os dados do usuário
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      throw new Error('Failed to upload resume');
    }

    const data = await response.json();
    return data.resumeUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    return null;
  }
}

export async function uploadCertifications(files: File[]): Promise<string[] | null> {
  try {
    // Verifica se o usuário está autenticado
    if (!isUserSignedIn()) {
      throw new Error('Você precisa estar logado para enviar certificações');
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`certification-${index}`, file);
    });

    const response = await fetch(`${API_URL}/users/certifications`, {
      method: 'POST',
      headers: {
        // O backend espera o token diretamente sem o prefixo "Bearer "
        'Authorization': token,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Erro de autenticação - limpa os dados do usuário
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      throw new Error('Failed to upload certifications');
    }

    const data = await response.json();
    return data.certificationUrls;
  } catch (error) {
    console.error('Error uploading certifications:', error);
    return null;
  }
}