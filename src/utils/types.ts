export type Role = 'CANDIDATE' | 'COMPANY' | undefined | null;

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  profile: Profile;
  chatIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Position = {
  x: number;
  y: number;
};

export interface Skill {
  id: string;
  name: string;
  isPriority: boolean;
}

export interface LanguageSkill {
  id: string;
  language: string;
  proficiency: string;
}

export interface Profile {
  picture: string;
  birthDate?: string | Date;
  location?: string;
  summary?: string;

  // Campos de candidato
  resume?: File | null;
  certifications?: File[];
  skills?: Skill[];
  education?: string;
  course?: string; // Campo para o curso de formação acadêmica
  experienceYears?: string;
  seniority?: string;
  availability?: string;
  languageSkills?: LanguageSkill[];
  expectedSalary?: string; // Campo de pretensão salarial

  // Campos de empresa
  industrySector?: string;
  companySize?: string;
  website?: string;
  workModel?: string;
  benefits?: string[];
  hiringAreas?: string[];
  companyTechnologies?: string[];
}

export type FileWithPreview = File & {
  preview?: string;
};
