// Habilidades predefinidas para seleção
export const predefinedSkills = [
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
].sort();

// Opções para o campo de formação acadêmica
export const educationOptions = [
  { value: 'fundamental', label: 'Ensino Fundamental' },
  { value: 'medio', label: 'Ensino Médio' },
  { value: 'tecnico', label: 'Ensino Técnico' },
  { value: 'superior_incompleto', label: 'Superior Incompleto' },
  { value: 'superior_cursando', label: 'Superior em Andamento' },
  { value: 'superior', label: 'Superior Completo' },
  { value: 'posgraduacao', label: 'Pós-graduação' },
  { value: 'mestrado', label: 'Mestrado' },
  { value: 'doutorado', label: 'Doutorado' },
];

// Opções para o campo de experiência profissional
export const experienceOptions = [
  { value: 'sem_experiencia', label: 'Sem experiência' },
  { value: 'menos_1', label: 'Menos de 1 ano' },
  { value: '1_2', label: '1-2 anos' },
  { value: '3_5', label: '3-5 anos' },
  { value: '6_10', label: '6-10 anos' },
  { value: 'mais_10', label: 'Mais de 10 anos' },
];

// Opções para o campo de senioridade
export const seniorityOptions = [
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'lideranca', label: 'Liderança/Gestão' },
];

// Opções para o campo de disponibilidade
export const availabilityOptions = [
  { value: 'integral', label: 'Tempo Integral' },
  { value: 'parcial', label: 'Meio Período' },
  { value: 'freelancer', label: 'Freelancer/Projetos' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'aprendiz', label: 'Jovem Aprendiz' },
].sort((a, b) => a.label.localeCompare(b.label));

// Opções para o campo de setor/indústria (empresas)
export const industrySectorOptions = [
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'educacao', label: 'Educação' },
  { value: 'financas', label: 'Finanças' },
  { value: 'industria', label: 'Indústria' },
  { value: 'logistica', label: 'Logística/Transporte' },
  { value: 'marketing', label: 'Marketing/Publicidade' },
  { value: 'outro', label: 'Outro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'telecomunicacoes', label: 'Telecomunicações' },
  { value: 'turismo', label: 'Turismo/Hotelaria' },
  { value: 'varejo', label: 'Varejo' },
];

// Opções para o campo de porte da empresa
export const companySizeOptions = [
  { value: 'startup', label: 'Startup' },
  { value: 'pequena', label: 'Pequena' },
  { value: 'media', label: 'Média' },
  { value: 'grande', label: 'Grande' },
  { value: 'multinacional', label: 'Multinacional' },
];

// Opções para o campo de modelo de trabalho
export const workModelOptions = [
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
];

// Opções para o campo de benefícios
export const benefitsOptions = [
  { value: 'auxilio_creche', label: 'Auxílio-creche' },
  { value: 'home_office', label: 'Auxílio home office' },
  { value: 'bonus', label: 'Bônus/Comissões' },
  { value: 'cursos', label: 'Cursos/Capacitação' },
  { value: 'day_off', label: 'Day off de aniversário' },
  { value: 'gympass', label: 'Gympass/Academia' },
  { value: 'horario_flexivel', label: 'Horário flexível' },
  { value: 'participacao_lucros', label: 'Participação nos lucros' },
  { value: 'plano_odontologico', label: 'Plano odontológico' },
  { value: 'plano_saude', label: 'Plano de saúde' },
  { value: 'seguro_vida', label: 'Seguro de vida' },
  { value: 'vale_alimentacao', label: 'Vale-alimentação' },
  { value: 'vale_refeicao', label: 'Vale-refeição' },
].sort((a, b) => a.label.localeCompare(b.label));

// Opções para o campo de áreas de contratação
export const hiringAreasOptions = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'atendimento', label: 'Atendimento ao Cliente' },
  { value: 'comercial', label: 'Comercial/Vendas' },
  { value: 'design', label: 'Design' },
  { value: 'desenvolvimento', label: 'Desenvolvimento/Programação' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'produto', label: 'Produto' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'ux', label: 'UX/UI' },
].sort((a, b) => a.label.localeCompare(b.label));

// Opções para o campo de tecnologias utilizadas pela empresa
export const companyTechnologiesOptions = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'c_sharp', label: 'C#' },
  { value: 'data_science', label: 'Ciência de Dados' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'docker', label: 'Docker' },
  { value: 'gcp', label: 'Google Cloud' },
  { value: 'ia', label: 'Inteligência Artificial' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'node', label: 'Node.js' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'typescript', label: 'TypeScript' },
].sort((a, b) => a.label.localeCompare(b.label));

// Lista de níveis superiores de educação (para verificações condicionais)
export const higherEducationLevels = [
  'superior_incompleto',
  'superior_cursando',
  'superior',
  'posgraduacao',
  'mestrado',
  'doutorado',
];

// Opções de idiomas para seleção de idiomas no perfil (ordenado)
export const languageOptions = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Mandarim',
  'Japonês',
  'Russo',
  'Árabe',
  'Hindi',
  'Coreano',
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

// Níveis de proficiência para seleção de idiomas (não ordenado)
export const proficiencyLevels = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'fluent', label: 'Fluente' },
  { value: 'native', label: 'Nativo' },
];
