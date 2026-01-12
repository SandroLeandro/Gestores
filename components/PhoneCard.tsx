
import React from 'react';
import { Phone } from '../types';

interface PhoneCardProps {
  phone: Phone;
  isAdmin: boolean;
  isOldest: boolean;
  onEdit: (phone: Phone) => void;
  onDelete: (id: number) => void;
}

const PhoneCard: React.FC<PhoneCardProps> = ({ phone, isAdmin, isOldest, onEdit, onDelete }) => {
  const formatPhone = (num: string) => {
    let cleaned = String(num).replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    
    if (cleaned.length === 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return cleaned;
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className={`${isOldest ? 'bg-purple-300 shadow-[0_0_15px_rgba(159,18,57,0.3)]' : 'bg-purple-100'} rounded-xl border-l-[8px] border-rose-900 p-4 shadow-md mb-4 flex flex-col gap-1 text-black font-bold transition-all duration-300 relative z-10`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-2xl">{formatPhone(phone.number)}</span>
        <span className="text-xs opacity-50">ID: {phone.id}</span>
      </div>

      <div className="mt-1">
        <div className="text-xs uppercase opacity-70">Publicador:</div>
        <div className="text-sm">{phone.publicador}</div>
      </div>

      <div className="mt-1">
        <div className="text-xs uppercase opacity-70">Status:</div>
        <div className={`${isOldest ? 'bg-purple-500 text-white' : 'bg-purple-300 text-purple-900'} px-2 py-0.5 rounded inline-block text-xs font-bold`}>
          {phone.status}
        </div>
      </div>

      <div className="mt-1">
        <div className="text-xs uppercase opacity-70">Fecha:</div>
        <div className="text-sm">{formatDateForDisplay(phone.data)}</div>
      </div>

      {phone.observacoes && (
        <div className="mt-1">
          <div className="text-xs uppercase opacity-70">Observaciones:</div>
          <div className="text-sm">{phone.observacoes}</div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => onEdit(phone)}
          className="bg-purple-900 text-white flex-1 py-2 rounded-lg hover:brightness-110 transition shadow active:scale-95"
        >
          Editar
        </button>
        {isAdmin && (
          <button 
            onClick={() => onDelete(phone.id)}
            className="bg-red-600 text-white flex-1 py-2 rounded-lg hover:brightness-110 transition shadow active:scale-95"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default PhoneCard;
