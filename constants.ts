
import { VisitStatus } from './types';

export const ALERT_MESSAGES = {
  CANCELLED: "Cancelado. No debe ser visitado",
  CAN_VISIT: "Puede ser visitado",
  WAIT: "Espere. Fue visitado recientemente"
};

/**
 * Mapeo para convertir estados antiguos en portugués al nuevo estándar en español.
 */
export const normalizeStatus = (status: string): VisitStatus => {
  const mapping: Record<string, VisitStatus> = {
    // Portugués -> Español
    "Não se encontrou em casa": VisitStatus.NOT_HOME,
    "Não quis atender": VisitStatus.REFUSED,
    "Estava ocupado": VisitStatus.BUSY,
    "Deixamos uma Carta ou uma Publicação": VisitStatus.LEFT_LETTER,
    "Conseguimos conversar com a pessoa": VisitStatus.CONVERSATION,
    "Conseguimos conversar com a pessoa e usar a Bíblia": VisitStatus.BIBLE,
    "Conseguimos conversar com a pessoa, usamos a Bíblia e deixamos Publicações": VisitStatus.BIBLE_AND_PUBS,
    "Já é uma Revisita ou Estudo de outros": VisitStatus.REVISIT,
    "Não existe estrangeiros neste endereço": VisitStatus.NO_FOREIGNERS,
    "Endereço não encontrado": VisitStatus.NOT_FOUND,
    "Endereço novo": VisitStatus.NEW_ADDRESS,
  };

  return mapping[status] || (status as VisitStatus);
};

export const getAlertStatus = (rawStatus: string, date: string) => {
  const status = normalizeStatus(rawStatus);
  const visitDate = new Date(date);
  const now = new Date();
  
  // Normalizar fechas para comparar solo días (GMT/UTC para evitar desfases de zona horaria)
  const d1 = Date.UTC(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
  const d2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));

  if (status === VisitStatus.NO_FOREIGNERS || status === VisitStatus.NOT_FOUND) {
    return { text: ALERT_MESSAGES.CANCELLED, bg: 'bg-red-600', textCol: 'text-white' };
  }

  if (status === VisitStatus.NEW_ADDRESS) {
    return { text: ALERT_MESSAGES.CAN_VISIT, bg: 'bg-[#39FF14]', textCol: 'text-black' };
  }

  if (status === VisitStatus.NOT_HOME) {
    if (diffDays > 8) {
      return { text: ALERT_MESSAGES.CAN_VISIT, bg: 'bg-[#39FF14]', textCol: 'text-black' };
    } else {
      return { text: ALERT_MESSAGES.WAIT, bg: 'bg-[#FFFF00]', textCol: 'text-black' };
    }
  }

  const conversionalStatuses = [
    VisitStatus.REFUSED,
    VisitStatus.BUSY,
    VisitStatus.LEFT_LETTER,
    VisitStatus.CONVERSATION,
    VisitStatus.BIBLE,
    VisitStatus.BIBLE_AND_PUBS,
    VisitStatus.REVISIT
  ];

  if (conversionalStatuses.includes(status)) {
    if (diffDays > 22) {
      return { text: ALERT_MESSAGES.CAN_VISIT, bg: 'bg-[#39FF14]', textCol: 'text-black' };
    } else {
      return { text: ALERT_MESSAGES.WAIT, bg: 'bg-[#FFFF00]', textCol: 'text-black' };
    }
  }

  return { text: '', bg: '', textCol: '' };
};
