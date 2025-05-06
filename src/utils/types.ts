export type Role = 'CANDIDATE' | 'COMPANY' | null;

export type Position = {
  x: number;
  y: number;
};

// Tipos para a página de perfil
export type Skill = {
  id: string;
  name: string;
  isPriority: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  birthDate?: Date | null;
  resume?: File | null;
  certifications?: File[];
  skills?: Skill[];
  avatarUrl?: string;
};

export type FileWithPreview = File & {
  preview?: string;
};
