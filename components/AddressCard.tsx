
import React from 'react';
import { Address, UserRole } from '../types';
import { getAlertStatus } from '../constants';

interface AddressCardProps {
  address: Address;
  isAdmin: boolean;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, isAdmin, onEdit, onDelete }) => {
  const alert = getAlertStatus(address.status, address.data);
  
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-[#f3e8ff] rounded-xl border-l-[8px] border-purple-900 p-4 shadow-md mb-4 flex flex-col gap-1 text-black font-bold">
      <div className="bg-[#ddd6fe] -mx-4 -mt-4 px-4 py-3 rounded-t-xl mb-1 text-purple-900 flex justify-between items-center text-2xl">
        <span>{address.bairro}</span>
        <span className="opacity-90">{address.id}</span>
      </div>
      
      <div className="text-xl">
        {address.rua}{address.numero && `, ${address.numero}`}
      </div>

      {address.complemento && (
        <div className="text-sm opacity-80">
          {address.complemento}
        </div>
      )}

      {alert.text && (
        <div className={`${alert.bg} ${alert.textCol} px-3 py-1 rounded text-center text-lg uppercase mt-1 mb-1 shadow-sm`}>
          {alert.text}
        </div>
      )}

      {address.observacoes && (
        <div className="mt-1">
          <div className="text-xs uppercase opacity-70">Observaciones:</div>
          <div className="text-sm">{address.observacoes}</div>
        </div>
      )}

      <div className="mt-2">
        <div className="text-xs uppercase opacity-70">Status:</div>
        <div className="bg-purple-300 text-purple-800 px-2 py-1 rounded inline-block text-sm">
          {address.status}
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xs uppercase opacity-70">Publicador:</div>
        <div className="text-sm">{address.publicador}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs uppercase opacity-70">Fecha:</div>
        <div className="text-sm">{formatDateForDisplay(address.data)}</div>
      </div>

      {address.gpsLink && (
        <div className="mt-3">
          <a 
            href={address.gpsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-700 underline text-xl"
          >
            Ver en Google Maps
          </a>
        </div>
      )}

      {address.noLetters && (
        <div className="mt-3 bg-[#FF5F1F] text-black text-center py-1 rounded text-xs uppercase shadow-sm">
          No dejar Cartas o Publicaciones
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => onEdit(address)}
          className="bg-purple-900 text-white flex-1 py-2 rounded-lg hover:bg-purple-800 transition shadow"
        >
          Editar
        </button>
        {isAdmin && (
          <button 
            onClick={() => onDelete(address.id)}
            className="bg-red-600 text-white flex-1 py-2 rounded-lg hover:bg-red-700 transition shadow"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
