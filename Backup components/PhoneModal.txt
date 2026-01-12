
import React, { useState, useEffect } from 'react';
import { Phone, PhoneStatus } from '../types';
import { dataService } from '../services/dataService';

interface PhoneModalProps {
  isOpen: boolean;
  phoneToEdit: Phone | null;
  allPhones: Phone[];
  onClose: () => void;
  onSave: (phone: Phone) => void;
  publisherName: string;
}

const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, phoneToEdit, allPhones, onClose, onSave, publisherName }) => {
  const getLocalISODate = () => {
    return new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  const [formData, setFormData] = useState<Partial<Phone>>({
    id: 0,
    number: '',
    publicador: publisherName,
    status: PhoneStatus.NUMERO_NUEVO,
    data: getLocalISODate(),
    observacoes: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const normalizeDateForInput = (val: string): string => {
    if (!val) return getLocalISODate();
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    return val;
  };

  useEffect(() => {
    if (isOpen) {
      if (phoneToEdit) {
        setFormData({ 
          ...phoneToEdit,
          data: normalizeDateForInput(phoneToEdit.data)
        });
      } else {
        setFormData({
          id: dataService.getNextId(allPhones),
          number: '',
          publicador: publisherName,
          status: PhoneStatus.NUMERO_NUEVO,
          data: getLocalISODate(),
          observacoes: ''
        });
      }
    }
  }, [phoneToEdit, isOpen, publisherName, allPhones]);

  const validateAndSave = () => {
    let digits = (formData.number || '').replace(/\D/g, '');
    
    // Ignorar el '0' a la izquierda
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    if (digits.length < 10) {
      setValidationError("El número está incompleto. Debe incluir el DDD (2 dígitos) y el número (8 o 9 dígitos).");
      return;
    }

    if (digits.length === 10) {
      if (digits[2] === '9') {
        setValidationError("Los números fijos no comienzan con el dígito 9. Si es un celular, verifique si falta un dígito.");
        return;
      }
    }

    if (digits.length === 11) {
      if (digits[2] !== '9') {
        setValidationError("Los números de celular deben comenzar con el dígito 9 después del DDD.");
        return;
      }
    }

    if (digits.length > 11) {
      setValidationError("El número tiene demasiados dígitos.");
      return;
    }

    onSave({ ...formData, number: digits } as Phone);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="bg-red-100 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-rose-900 font-bold border-2 border-rose-400">
          <h2 className="text-2xl mb-4 text-center border-b-2 border-rose-400 pb-1 uppercase">
            {phoneToEdit ? 'Editar Teléfono' : 'Nuevo Teléfono'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase opacity-70">Número de Teléfono:*</label>
              <input 
                type="text" 
                value={formData.number} 
                onChange={e => setFormData({...formData, number: e.target.value})} 
                className="w-full bg-white p-3 rounded-xl border border-rose-400 shadow-inner"
                placeholder="(XX) XXXXX-XXXX"
              />
              <p className="text-[10px] mt-1 opacity-60">Ej: (11) 98888-7777 (Cel) o (11) 3333-4444 (Fijo)</p>
            </div>

            <div>
              <label className="block text-xs uppercase opacity-70">Status:</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as PhoneStatus})}
                className="w-full bg-white p-3 rounded-xl border border-rose-400 shadow-inner"
              >
                {Object.values(PhoneStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs uppercase opacity-70">Publicador:</label>
                <input type="text" value={formData.publicador} readOnly className="w-full bg-rose-100 p-3 rounded-xl border border-rose-400 cursor-not-allowed"/>
              </div>
              <div className="flex-1">
                <label className="block text-xs uppercase opacity-70">Fecha:</label>
                <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full bg-white p-3 rounded-xl border border-rose-400 shadow-inner"/>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase opacity-70">Observaciones:</label>
              <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full bg-white p-3 rounded-xl border border-rose-400 shadow-inner" rows={2}/>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={validateAndSave} className="flex-1 bg-rose-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition">Salvar</button>
            <button onClick={onClose} className="flex-1 bg-white border-2 border-rose-900 text-rose-900 py-4 rounded-xl font-bold active:scale-95 transition">Cancelar</button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-rose-300 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border-2 border-rose-400 text-center">
            <p className="text-rose-900 font-bold text-lg mb-6">
              {validationError}
            </p>
            <button 
              onClick={() => setValidationError(null)} 
              className="w-full bg-rose-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneModal;
