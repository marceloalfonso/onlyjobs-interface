export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  profile: Record<string, any>;
  chatIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Role = 'CANDIDATE' | 'COMPANY' | undefined | null;

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

export type Skill = {
  id: string;
  name: string;
  isPriority: boolean;
};

export type FileWithPreview = File & {
  preview?: string;
};
