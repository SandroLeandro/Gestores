import React, { useState, useEffect, useMemo } from 'react';
import { User, Address, NeighborhoodMap, UserRole, VisitStatus, Phone, PhoneStatus } from './types';
import { streamAddresses, streamPhones, saveAddress, savePhone, db } from './src/services/services/Firebase'; 

// Se o código acima não funcionar, tente este (que é o caminho real que vimos no seu dir):
// import { streamAddresses, streamPhones, saveAddress, savePhone, db } from './src/services/Firebase';

import { collection, onSnapshot } from 'firebase/firestore';
import AddressCard from './components/AddressCard';
import AddressModal from './components/AddressModal';
import PhoneCard from './components/PhoneCard';
import PhoneModal from './components/PhoneModal';

const App: React.FC = () => {
  const getLocalISODate = () => {
    return new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  const [viewMode, setViewMode] = useState<string>('addresses');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(dataService.getUsers());
  const [isSettingUp, setIsSettingUp] = useState(dataService.getUsers().length === 0);

  // DATA STATE (Inicializados com Firebase)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [maps, setMaps] = useState<NeighborhoodMap[]>(dataService.getMaps());
  const [filterBairro, setFilterBairro] = useState('Todos');

  // UI STATE
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [phoneToEdit, setPhoneToEdit] = useState<Phone | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [setupForm, setSetupForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [changePassForm, setChangePassForm] = useState({ newPass: '', confirmPass: '' });

  // 1. ESCUTAR FIREBASE EM TEMPO REAL
  useEffect(() => {
    const unsubA = streamAddresses((data) => setAddresses(data as Address[]));
    const unsubP = streamPhones((data) => setPhones(data as Phone[]));
    
    // Escuta usuários também se quiser multiusuário completo
    const unsubU = onSnapshot(collection(db, "users"), (snapshot) => {
      const uData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
      if (uData.length > 0) {
        setUsers(uData);
        setIsSettingUp(false);
      }
    });

    return () => { unsubA(); unsubP(); unsubU(); };
  }, []);

  const formatPhoneForHeader = (num: string) => {
    let cleaned = ('' + num).replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length === 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return num;
  };

  const handleLogin = () => {
    const user = users.find(u => u.name.toLowerCase() === loginForm.name.toLowerCase());
    if (!user || user.password !== loginForm.password) {
      alert("Credenciales incorrectas.");
      return;
    }
    setCurrentUser(user);
  };

  const sortedPhones = useMemo(() => {
    return [...phones].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [phones]);

  // LOGIN / SETUP SCREENS
  if (isSettingUp) return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md font-bold">
        <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center">Configuración Inicial</h1>
        <div className="space-y-4">
          <input placeholder="Nombre" className="w-full border p-3 rounded" value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} />
          <input type="password" placeholder="Contraseña" className="w-full border p-3 rounded" value={setupForm.password} onChange={e => setSetupForm({...setupForm, password: e.target.value})} />
          <input type="password" placeholder="Confirmar Contraseña" className="w-full border p-3 rounded" value={setupForm.confirmPassword} onChange={e => setSetupForm({...setupForm, confirmPassword: e.target.value})} />
          <button onClick={handleSetup} className="w-full bg-purple-900 text-white font-bold py-3 rounded active:scale-95 transition shadow-lg">Crear Administrador</button>
        </div>
      </div>
    </div>
  );

  if (!currentUser) return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4 font-bold">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center uppercase">Gestor Cloud</h1>
        <div className="space-y-4">
          <input placeholder="Nombre" className="w-full border p-3 rounded" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
          <input type="password" placeholder="Contraseña" className="w-full border p-3 rounded" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
          <button onClick={handleLogin} className="w-full bg-purple-900 text-white py-4 rounded-xl shadow-lg active:scale-95 transition">Entrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden border-x border-gray-200">
      {/* HEADER */}
      <div className={`${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white p-4 z-50 shadow-lg rounded-b-2xl transition-colors`}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 text-2xl">☰</button>
          <h1 className="text-lg font-bold flex-1 text-center truncate uppercase">
            {viewMode === 'addresses' ? 'DIRECCIONES' : 'TELÉFONOS'}
          </h1>
          <button onClick={() => setViewMode(prev => prev === 'addresses' ? 'phones' : 'addresses')} className="p-1 text-2xl">
            {viewMode === 'addresses' ? '📞' : '📍'}
          </button>
        </div>

        <div className="mt-2 space-y-1">
          <label className="text-[10px] font-bold block text-center uppercase opacity-80">
            {viewMode === 'addresses' ? 'Barrio Seleccionado:' : 'Próximo número:'}
          </label>
          {viewMode === 'addresses' ? (
            <select value={filterBairro} onChange={e => setFilterBairro(e.target.value)} className="w-full bg-white text-purple-900 font-bold p-2 rounded-lg text-sm outline-none shadow-inner">
              <option value="Todos">Todos los barrios</option>
              {Array.from(new Set(addresses.map(a => a.bairro))).sort().map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <div className="bg-white text-rose-900 font-black py-1 px-4 rounded-lg shadow-inner text-xl w-max mx-auto">
              {sortedPhones.length > 0 ? formatPhoneForHeader(sortedPhones[0].number) : 'N/A'}
            </div>
          )}
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 z-10 custom-scrollbar">
        {viewMode === 'addresses' ? (
          addresses.filter(a => filterBairro === 'Todos' || a.bairro === filterBairro).map(addr => (
            <AddressCard key={addr.id} address={addr} isAdmin={currentUser.role === UserRole.ADMIN} onEdit={() => { setAddressToEdit(addr); setIsAddressModalOpen(true); }} />
          ))
        ) : (
          sortedPhones.map(phone => (
            <PhoneCard key={phone.id} phone={phone} isAdmin={currentUser.role === UserRole.ADMIN} onEdit={() => { setPhoneToEdit(phone); setIsPhoneModalOpen(true); }} />
          ))
        )}
      </div>

      {/* BOTÓN FLOTANTE */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent z-50">
        <div className={`${viewMode === 'addresses' ? 'bg-purple-300 border-purple-800' : 'bg-rose-300 border-rose-800'} p-3 flex items-center justify-between border-2 shadow-xl rounded-2xl`}>
          <button onClick={() => viewMode === 'addresses' ? setIsAddressModalOpen(true) : setIsPhoneModalOpen(true)} className={`${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white font-bold px-6 py-2 rounded-xl text-xs active:scale-95 transition`}>
            + NUEVO
          </button>
          <span className="text-[9px] font-black text-gray-700 uppercase">Sincronización Cloud Activa</span>
        </div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        addressToEdit={addressToEdit} 
        allAddresses={addresses} 
        onClose={() => { setIsAddressModalOpen(false); setAddressToEdit(null); }} 
        onSave={async (d) => { await saveAddress(d); setIsAddressModalOpen(false); }} 
        publisherName={currentUser.name} 
      />
      
      <PhoneModal 
        isOpen={isPhoneModalOpen} 
        phoneToEdit={phoneToEdit} 
        allPhones={phones} 
        onClose={() => { setIsPhoneModalOpen(false); setPhoneToEdit(null); }} 
        onSave={async (d) => { await savePhone(d); setIsPhoneModalOpen(false); }} 
        publisherName={currentUser.name} 
      />
    </div>
  );
};

export default App;