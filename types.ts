
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  password?: string;
  role: UserRole;
}

export enum VisitStatus {
  NOT_HOME = "No se encontró en casa",
  REFUSED = "No quiso atender",
  BUSY = "Estaba ocupado",
  LEFT_LETTER = "Dejamos una Carta o una Publicación",
  CONVERSATION = "Logramos conversar con la persona",
  BIBLE = "Logramos conversar with person and use Bible",
  BIBLE_AND_PUBS = "Logramos conversar, usamos la Biblia y dejamos Publicaciones",
  REVISIT = "Ya es una Revisita o Estudio de otros",
  NO_FOREIGNERS = "No existen extranjeros en esta dirección",
  NOT_FOUND = "Dirección no encontrada",
  NEW_ADDRESS = "Dirección nueva"
}

export enum PhoneStatus {
  NO_COMPLETO = "No completó la ligación",
  NO_ATENDIO = "No atendió",
  DESLIGO = "Atendió, pero desligó al saber del que se trataba",
  OCUPADO = "Ocupado",
  CONVERSO = "Conseguí conversar con el extranjero",
  CONVERSO_BIBLIA = "Conseguí conversar con el extranjero y leí la Biblia pra él",
  NO_EXTRANJERO = "El número no pertenece a un extranjero",
  PIDIO_NO_LIGAR = "Pidió que no ligássemos más",
  NUMERO_NUEVO = "Número nuevo"
}

export interface Address {
  id: number;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  observacoes: string;
  gpsLink: string;
  status: VisitStatus;
  publicador: string;
  data: string; // YYYY-MM-DD
  noLetters: boolean;
}

export interface Phone {
  id: number;
  number: string;
  publicador: string;
  status: PhoneStatus | string;
  data: string;
  observacoes: string;
}

export interface NeighborhoodMap {
  bairro: string;
  mapLink: string;
}
