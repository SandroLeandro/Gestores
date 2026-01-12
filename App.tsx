
import React, { useState, useEffect, useMemo } from 'react';
import { User, Address, NeighborhoodMap, UserRole, VisitStatus, Phone, PhoneStatus } from './types';
import { dataService } from './services/dataService';
import { normalizeStatus } from './constants';
import AddressCard from './components/AddressCard';
import AddressModal from './components/AddressModal';
import PhoneCard from './components/PhoneCard';
import PhoneModal from './components/PhoneModal';

const App: React.FC = () => {
  const getLocalISODate = () => {
    // Ajuste para el huso horario de Brasília
    return new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  // Config state
  // Widening type to string to prevent unintentional comparison errors in TypeScript flow analysis
  const [viewMode, setViewMode] = useState<string>('addresses');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(dataService.getUsers());
  const [isSettingUp, setIsSettingUp] = useState(dataService.getUsers().length === 0);

  // Data state
  const [addresses, setAddresses] = useState<Address[]>(dataService.getAddresses());
  const [phones, setPhones] = useState<Phone[]>(dataService.getPhones());
  const [maps, setMaps] = useState<NeighborhoodMap[]>(dataService.getMaps());
  const [filterBairro, setFilterBairro] = useState('Todos');

  // UI state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [phoneToEdit, setPhoneToEdit] = useState<Phone | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isAdminAlertOpen, setIsAdminAlertOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isMapManagementOpen, setIsMapManagementOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'addr' | 'phone'} | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  // Form states for management
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  
  // Change Password state
  const [changePassForm, setChangePassForm] = useState({ newPass: '', confirmPass: '' });
  const [forgotPassName, setForgotPassName] = useState('');

  // Helper function to format phone for display
  const formatPhoneForHeader = (num: string) => {
    let cleaned = ('' + num).replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    
    if (cleaned.length === 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return num;
  };

  const handleLogout = () => {
    setIsConfirmExitOpen(false);
    setCurrentUser(null);
  };

  const handleSetup = () => {
    if (!setupForm.name || !setupForm.password || !setupForm.confirmPassword) return alert("Por favor rellene todos los campos.");
    if (setupForm.password !== setupForm.confirmPassword) return alert("Las contraseñas no coinciden.");
    const newUser: User = { id: crypto.randomUUID(), name: setupForm.name, password: setupForm.password, role: UserRole.ADMIN };
    dataService.saveUsers([newUser]);
    setUsers([newUser]);
    setCurrentUser(newUser);
    setIsSettingUp(false);
    alert(`¡Felicidades ${newUser.name}! Ahora eres el Administrador del App.`);
  };

  const handleLogin = () => {
    const user = users.find(u => u.name.toLowerCase() === loginForm.name.toLowerCase());
    if (!user) {
      alert("Usuario no encontrado.");
      return;
    }
    if (user.password !== loginForm.password) {
      alert("Contraseña incorrecta.");
      return;
    }
    setIsConfirmExitOpen(false);
    setCurrentUser(user);
  };

  const handleForgotPassword = () => {
    alert("Por favor, contacte al Administrador de la App para recuperar su contraseña.");
    setIsForgotPassOpen(false);
  };

  const handleChangePassword = () => {
    if (!changePassForm.newPass) {
      alert("Por favor, ingrese una nueva contraseña.");
      return;
    }
    if (changePassForm.newPass !== changePassForm.confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    
    const updatedUsers = users.map(u => 
      u.id === currentUser?.id ? { ...u, password: changePassForm.newPass } : u
    );
    setUsers(updatedUsers);
    dataService.saveUsers(updatedUsers);
    setCurrentUser({ ...currentUser!, password: changePassForm.newPass });
    setIsChangePasswordOpen(false);
    alert("Contraseña actualizada con éxito.");
  };

  const sortedPhones = useMemo(() => {
    return [...phones].sort((a, b) => {
      const dateA = new Date(a.data).getTime();
      const dateB = new Date(b.data).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
    });
  }, [phones]);

  const saveAddress = (addr: Address) => {
    const newAddresses = addressToEdit ? addresses.map(a => a.id === addr.id ? addr : a) : [...addresses, addr];
    setAddresses(newAddresses);
    dataService.saveAddresses(newAddresses);
    setIsAddressModalOpen(false);
    setAddressToEdit(null);
  };

  const savePhone = (phone: Phone) => {
    const newPhones = phoneToEdit ? phones.map(p => p.id === phone.id ? phone : p) : [...phones, phone];
    setPhones(newPhones);
    dataService.savePhones(newPhones);
    setIsPhoneModalOpen(false);
    setPhoneToEdit(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'addr') {
      const newList = addresses.filter(a => a.id !== itemToDelete.id);
      setAddresses(newList);
      dataService.saveAddresses(newList);
    } else {
      const newList = phones.filter(p => p.id !== itemToDelete.id);
      setPhones(newList);
      dataService.savePhones(newList);
    }
    setItemToDelete(null);
  };

  const normalizeDate = (val: any): string => {
    if (!val) return getLocalISODate();
    
    // Si es un código de fecha de Excel (número)
    if (typeof val === 'number') {
      try {
        const dateObj = (window as any).XLSX.SSF.parse_date_code(val);
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      } catch (e) {
        return getLocalISODate();
      }
    }

    let dateStr = String(val).trim();
    
    // Formato DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        if (y.length === 4) return `${y}-${m}-${d}`;
        if (y.length === 2) return `20${y}-${m}-${d}`;
      }
    }
    
    // Formato YYYY-MM-DD (Evitar desfases con new Date())
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
         if (parts[0].length === 4) return dateStr; 
         return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    return getLocalISODate();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'addr' | 'maps' | 'phones') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = (window as any).XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = (window as any).XLSX.utils.sheet_to_json(ws);
      
      if (type === 'addr') {
        let currentBatch = [...addresses];
        const processedAddresses = (data as any[]).map((a) => {
          const id = a.id ? Number(a.id) : dataService.getNextId(currentBatch);
          const newAddr = { ...a, id, data: normalizeDate(a.data) };
          currentBatch.push(newAddr);
          return newAddr;
        });
        setAddresses(processedAddresses);
        dataService.saveAddresses(processedAddresses);
      } else if (type === 'maps') {
        setMaps(data as NeighborhoodMap[]);
        dataService.saveMaps(data as NeighborhoodMap[]);
      } else if (type === 'phones') {
        let currentBatch = [...phones];
        const processedPhones = (data as any[]).map((p) => {
          let num = String(p.number || '').replace(/\D/g, '');
          if (num.startsWith('0')) num = num.substring(1);
          const id = p.id ? Number(p.id) : dataService.getNextId(currentBatch);
          const newPhone = { ...p, id, number: num, data: normalizeDate(p.data) };
          currentBatch.push(newPhone);
          return newPhone;
        });
        setPhones(processedPhones);
        dataService.savePhones(processedPhones);
      }
      alert("Importación completada.");
      setIsMenuOpen(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = (type: 'addr' | 'maps' | 'phones') => {
    let dataToExport: any[] = [];
    let fileName = "";
    if (type === 'addr') { dataToExport = addresses; fileName = "direcciones.xlsx"; }
    else if (type === 'maps') { dataToExport = maps; fileName = "mapas.xlsx"; }
    else if (type === 'phones') { dataToExport = phones; fileName = "telefonos.xlsx"; }
    
    const ws = (window as any).XLSX.utils.json_to_sheet(dataToExport);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Datos");
    (window as any).XLSX.writeFile(wb, fileName);
    setIsMenuOpen(false);
  };

  const openNeighborhoodMap = () => {
    const searchKey = filterBairro === 'Todos' ? 'Todos los barrios' : filterBairro;
    const map = maps.find(m => m.bairro === searchKey);
    if (map?.mapLink && map.mapLink.trim() !== "") {
      window.open(map.mapLink, '_blank');
    } else {
      alert("No hay un enlace de mapa registrado para este barrio.");
    }
  };

  const handleCreateUser = () => {
    if (!newUserName || !newUserPass) return;
    const newUser: User = { 
      id: crypto.randomUUID(), 
      name: newUserName, 
      password: newUserPass, 
      role: UserRole.USER 
    };
    const updated = [...users, newUser];
    setUsers(updated);
    dataService.saveUsers(updated);
    setNewUserName('');
    setNewUserPass('');
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) return alert("Debe haber al menos un usuario.");
    if (confirm("¿Desea eliminar este usuario?")) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      dataService.saveUsers(updated);
    }
  };

  const toggleAdmin = (id: string) => {
    const updated = users.map(u => 
      u.id === id ? { ...u, role: u.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN } : u
    );
    setUsers(updated);
    dataService.saveUsers(updated);
  };

  const [setupForm, setSetupForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });

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
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4">
      {!isForgotPassOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md font-bold">
          <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center">Iniciar Sesión</h1>
          <div className="space-y-4">
            <input placeholder="Nombre" className="w-full border p-3 rounded" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
            <input type="password" placeholder="Contraseña" className="w-full border p-3 rounded" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            <button onClick={handleLogin} className="w-full bg-purple-900 text-white font-bold py-3 rounded active:scale-95 transition shadow-lg">Entrar</button>
            <button onClick={() => setIsForgotPassOpen(true)} className="w-full text-purple-900/60 text-sm hover:underline">He olvidado mi contraseña</button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md font-bold">
          <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center">Recuperar Contraseña</h1>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-normal">Para recuperar su contraseña, por favor contacte al administrador de la aplicación.</p>
            <button onClick={handleForgotPassword} className="w-full bg-purple-900 text-white font-bold py-3 rounded active:scale-95 transition">Entendido</button>
            <button onClick={() => setIsForgotPassOpen(false)} className="w-full text-purple-900/60 text-sm hover:underline">Volver al login</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">
      {/* Header - Fixed/Sticky with high Z-index */}
      <div className={`${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white p-4 z-50 shadow-lg rounded-2xl mt-4 mx-4 sm:mx-6 flex-shrink-0 transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => currentUser.role === UserRole.ADMIN ? setIsMenuOpen(true) : setIsAdminAlertOpen(true)} className="active:scale-90 transition p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex-1 text-center truncate px-2 uppercase tracking-tight">
            {viewMode === 'addresses' ? 'GESTOR DE DIRECCIONES' : 'GESTOR DE TELÉFONOS'}
          </h1>
          <button 
            // Using functional update to avoid potential closure issues with narrowed viewMode
            onClick={() => setViewMode(prev => prev === 'addresses' ? 'phones' : 'addresses')} 
            className="active:scale-90 transition p-1"
          >
            {viewMode === 'addresses' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            )}
          </button>
        </div>

        <div className={`text-[10px] sm:text-xs font-bold text-center ${viewMode === 'addresses' ? 'text-purple-200' : 'text-rose-200'} uppercase mb-2`}>
          {viewMode === 'addresses' ? `${addresses.length} Direcciones Registradas` : `${phones.length} Números de Teléfonos Registrados`}
        </div>

        <div className="mt-2 space-y-2">
          <label className="text-xs font-bold block mb-1 text-center">
            {viewMode === 'addresses' ? 'Elegir un Barrio:' : 'Próximo número a ser llamado:'}
          </label>
          {viewMode === 'addresses' ? (
            <>
              <div className="relative">
                <select value={filterBairro} onChange={e => setFilterBairro(e.target.value)} className="w-full bg-white text-purple-900 font-bold p-3 rounded-lg appearance-none shadow-inner outline-none">
                  <option value="Todos">Todos</option>
                  {Array.from(new Set(addresses.map(a => a.bairro))).sort().map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-900">▼</div>
              </div>
              <button 
                onClick={openNeighborhoodMap}
                className="w-full bg-purple-300 text-purple-950 font-black py-2.5 rounded-lg border-2 border-white shadow-md active:scale-95 transition text-sm uppercase tracking-wide"
              >
                Abrir el mapa de este barrio
              </button>
            </>
          ) : (
            <div className={`bg-white ${viewMode === 'addresses' ? 'text-purple-900' : 'text-rose-900'} font-black py-1 px-3 rounded-lg shadow-inner shadow-inner text-center text-xl sm:text-2xl tracking-tighter shadow-black/10`}>
              {sortedPhones.length > 0 ? formatPhoneForHeader(sortedPhones[0].number) : 'N/A'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-24 z-10 scroll-smooth custom-scrollbar">
        {viewMode === 'addresses' ? (
          (filterBairro === 'Todos' ? addresses : addresses.filter(a => a.bairro === filterBairro)).map(addr => (
            <AddressCard key={`addr-${addr.id}`} address={addr} isAdmin={currentUser.role === UserRole.ADMIN} onEdit={a => { setAddressToEdit(a); setIsAddressModalOpen(true); }} onDelete={id => setItemToDelete({id, type: 'addr'})} />
          ))
        ) : (
          sortedPhones.map((phone, index) => (
            <PhoneCard 
              key={`phone-${phone.id}`} 
              phone={phone} 
              isAdmin={currentUser.role === UserRole.ADMIN} 
              isOldest={index === 0} 
              onEdit={p => { setPhoneToEdit(p); setIsPhoneModalOpen(true); }} 
              onDelete={id => setItemToDelete({id, type: 'phone'})} 
            />
          ))
        )}
      </div>

      {/* Footer - Solid background to hide content behind */}
      <div className="bg-gray-50 p-4 z-50 flex-shrink-0">
        <div className={`max-w-4xl mx-auto ${viewMode === 'addresses' ? 'bg-purple-300 border-purple-800' : 'bg-rose-300 border-rose-800'} p-4 flex items-center justify-between border-2 shadow-2xl rounded-2xl relative transition-colors duration-300`}>
          <button onClick={() => viewMode === 'addresses' ? setIsAddressModalOpen(true) : setIsPhoneModalOpen(true)} className={`${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white font-bold px-3 py-2 sm:px-4 sm:py-3 rounded-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-base active:scale-95 transition shadow-md`}>
            + {viewMode === 'addresses' ? 'Nueva Dirección' : 'Nuevo Teléfono'}
          </button>
          
          <button 
            onClick={() => setIsChangePasswordOpen(true)}
            className={`${viewMode === 'addresses' ? 'bg-purple-400' : 'bg-purple-900'} text-white font-bold border-2 border-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs uppercase tracking-widest hover:brightness-110 transition active:scale-95`}
          >
            {currentUser.name}
          </button>

          <button onClick={() => setIsConfirmExitOpen(true)} className={`bg-purple-200 border-2 ${viewMode === 'addresses' ? 'border-purple-900 text-purple-900' : 'border-rose-900 text-rose-900'} font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-base active:scale-95 transition`}>
            Salir
          </button>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <AddressModal isOpen={isAddressModalOpen} addressToEdit={addressToEdit} allAddresses={addresses} onClose={() => {setIsAddressModalOpen(false); setAddressToEdit(null);}} onSave={saveAddress} publisherName={currentUser.name} />
      <PhoneModal isOpen={isPhoneModalOpen} phoneToEdit={phoneToEdit} allPhones={phones} onClose={() => {setIsPhoneModalOpen(false); setPhoneToEdit(null);}} onSave={savePhone} publisherName={currentUser.name} />

      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`${viewMode === 'addresses' ? 'bg-purple-300 border-purple-400' : 'bg-rose-300 border-rose-400'} p-6 rounded-2xl shadow-2xl max-sm w-full border-2 font-bold`}>
            <h2 className={`${viewMode === 'addresses' ? 'text-purple-900' : 'text-rose-900'} font-bold text-xl mb-4 text-center uppercase`}>Cambiar Contraseña</h2>
            <div className="space-y-4">
              <input type="password" placeholder="Nueva Contraseña" className="w-full p-3 rounded-xl border border-gray-300" value={changePassForm.newPass} onChange={e => setChangePassForm({...changePassForm, newPass: e.target.value})} />
              <input type="password" placeholder="Confirmar Contraseña" className="w-full p-3 rounded-xl border border-gray-300" value={changePassForm.confirmPass} onChange={e => setChangePassForm({...changePassForm, confirmPass: e.target.value})} />
              <div className="flex gap-4 mt-4">
                <button onClick={handleChangePassword} className={`flex-1 ${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white font-bold py-3 rounded-xl active:scale-95 transition`}>Actualizar</button>
                <button onClick={() => setIsChangePasswordOpen(false)} className={`flex-1 bg-white border-2 ${viewMode === 'addresses' ? 'border-purple-900 text-purple-900' : 'border-rose-900 text-rose-900'} font-bold py-3 rounded-xl active:scale-95 transition`}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmExitOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`${viewMode === 'addresses' ? 'bg-purple-300 border-purple-400' : 'bg-rose-300 border-rose-400'} p-6 rounded-2xl shadow-2xl max-sm w-full border-2 font-bold`}>
            <p className={`${viewMode === 'addresses' ? 'text-purple-900' : 'text-rose-900'} font-bold text-lg mb-6 text-center`}>¿Desea realmente salir del APP?</p>
            <div className="flex gap-4">
              <button onClick={handleLogout} className={`flex-1 ${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition`}>Sí</button>
              <button onClick={() => setIsConfirmExitOpen(false)} className={`flex-1 bg-white border-2 ${viewMode === 'addresses' ? 'border-purple-900 text-purple-900' : 'border-rose-900 text-rose-900'} font-bold py-3 rounded-xl active:scale-95 transition`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`${viewMode === 'addresses' ? 'bg-purple-300 border-purple-400' : 'bg-rose-300 border-rose-400'} p-6 rounded-2xl shadow-2xl max-sm w-full border-2 font-bold`}>
            <p className={`${viewMode === 'addresses' ? 'text-purple-900' : 'text-rose-900'} font-bold text-lg mb-6 text-center uppercase`}>¿Desea realmente eliminar este registro?</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className={`flex-1 ${viewMode === 'addresses' ? 'bg-purple-900' : 'bg-rose-900'} text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition`}>Sí</button>
              <button onClick={() => setItemToDelete(null)} className={`flex-1 bg-white border-2 ${viewMode === 'addresses' ? 'border-purple-900 text-purple-900' : 'border-rose-900 text-rose-900'} font-bold py-3 rounded-xl active:scale-95 transition`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="bg-white w-72 h-full shadow-2xl flex flex-col p-6 font-bold text-purple-900 animate-in slide-in-from-left duration-300 overflow-y-auto">
            <h2 className="text-2xl mb-6 border-b-2 border-purple-100 pb-2 uppercase tracking-tight">Opciones</h2>
            <button onClick={() => { setIsUserManagementOpen(true); setIsMenuOpen(false); }} className="text-left py-4 border-b border-purple-50 active:bg-purple-50 transition">Gestionar Usuarios</button>
            <button onClick={() => { setIsMapManagementOpen(true); setIsMenuOpen(false); }} className="text-left py-4 border-b border-purple-50 active:bg-purple-50 transition">Gestionar Mapas</button>
            
            <label className="text-left py-4 border-b border-purple-50 cursor-pointer flex justify-between items-center bg-purple-50/50 px-2 active:bg-purple-100 transition mt-4">
              <span>Importar Direcciones</span>
              <input type="file" accept=".xlsx,.xls" onChange={e => handleImport(e, 'addr')} className="hidden" />
            </label>
            <button onClick={() => handleExport('addr')} className="text-left py-4 border-b border-purple-50 bg-purple-50/50 px-2 active:bg-purple-100 transition">Exportar Direcciones</button>
            
            <label className="text-left py-4 border-b border-purple-50 cursor-pointer flex justify-between items-center bg-blue-50/50 px-2 active:bg-blue-100 transition mt-2">
              <span>Importar Mapas</span>
              <input type="file" accept=".xlsx,.xls" onChange={e => handleImport(e, 'maps')} className="hidden" />
            </label>
            <button onClick={() => handleExport('maps')} className="text-left py-4 border-b border-purple-50 bg-blue-50/50 px-2 active:bg-blue-100 transition">Exportar Mapas</button>

            <label className="text-left py-4 border-b border-purple-50 cursor-pointer flex justify-between items-center bg-green-50/50 px-2 active:bg-green-100 transition mt-2">
              <span>Importar Teléfonos</span>
              <input type="file" accept=".xlsx,.xls" onChange={e => handleImport(e, 'phones')} className="hidden" />
            </label>
            <button onClick={() => handleExport('phones')} className="text-left py-4 border-b border-purple-50 bg-green-50/50 px-2 active:bg-green-100 transition">Exportar Teléfonos</button>

            <button onClick={() => { setIsDeleteAllConfirmOpen(true); setIsMenuOpen(false); }} className="text-left py-4 text-red-600 active:bg-red-50 transition mt-6">Borrar Todo</button>
            <button onClick={() => setIsMenuOpen(false)} className="mt-auto bg-purple-900 text-white py-1 px-4 rounded-lg shadow-lg active:scale-95 transition uppercase">Cerrar</button>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {isUserManagementOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-purple-300 p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border-2 border-purple-400 font-bold text-purple-900">
            <h2 className="font-bold text-xl mb-4 text-center uppercase tracking-wide">Gestionar Usuarios</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-xl flex items-center justify-between border border-purple-300 shadow-sm">
                  <div className="flex flex-col">
                    <div className="font-bold flex items-center gap-1">{u.name} {u.role === UserRole.ADMIN && <span className="text-[8px] bg-purple-900 text-white px-1.5 py-0.5 rounded">ADMIN</span>}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <input type="checkbox" checked={u.role === UserRole.ADMIN} onChange={() => toggleAdmin(u.id)} className="w-5 h-5 cursor-pointer" />
                      <span className="text-[8px] uppercase mt-0.5">Admin</span>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 text-white w-8 h-8 rounded-lg font-black active:scale-90 transition shadow">X</button>
                  </div>
                </div>
              ))}
              <div className="bg-purple-100 p-4 rounded-xl mt-4 space-y-2 border-2 border-dashed border-purple-400">
                <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Nuevo Nombre" className="w-full p-2 rounded bg-white text-sm border border-purple-300 outline-none" />
                <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Contraseña Prov." className="w-full p-2 rounded bg-white text-sm border border-purple-300 outline-none" />
                <button onClick={handleCreateUser} className="w-full bg-purple-900 text-white py-2.5 rounded font-bold shadow active:scale-95 transition">Crear Usuario</button>
                <button onClick={() => setIsUserManagementOpen(false)} className="w-full bg-[#f3e8ff] border-2 border-purple-900 text-purple-900 font-bold py-2.5 rounded active:scale-95 transition mt-2">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMapManagementOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-purple-300 p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border-2 border-purple-400 font-bold text-purple-900">
            <h2 className="font-bold text-xl mb-4 uppercase tracking-wide">Gestionar Mapas</h2>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-xl border border-purple-300 shadow-sm">
                <div className="text-xs uppercase opacity-60 mb-1">Mapa General (Todos):</div>
                <input type="text" defaultValue={maps.find(m => m.bairro === 'Todos los barrios')?.mapLink || ''} className="w-full p-2 rounded bg-purple-50 text-xs border border-purple-100 outline-none font-bold" onBlur={(e) => {
                  const l = e.target.value;
                  let um = [...maps];
                  const idx = um.findIndex(m => m.bairro === 'Todos los barrios');
                  if (idx >= 0) um[idx].mapLink = l; else um.push({ bairro: 'Todos los barrios', mapLink: l });
                  setMaps(um); dataService.saveMaps(um);
                }} />
              </div>
              {Array.from(new Set(addresses.map(a => a.bairro))).sort().map(b => (
                <div key={b} className="bg-white p-3 rounded-xl border border-purple-300 shadow-sm">
                  <div className="text-xs uppercase opacity-60 mb-1 font-bold">{b}:</div>
                  <input type="text" defaultValue={maps.find(m => m.bairro === b)?.mapLink || ''} className="w-full p-2 rounded bg-purple-50 text-xs border border-purple-100 outline-none font-bold" onBlur={(e) => {
                    const l = e.target.value;
                    const idx = maps.findIndex(m => m.bairro === b);
                    let um = [...maps];
                    if (idx >= 0) um[idx].mapLink = l; else um.push({ bairro: b, mapLink: l });
                    setMaps(um); dataService.saveMaps(um);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsMapManagementOpen(false)} className="w-full bg-purple-900 text-white mt-6 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition uppercase tracking-wider">Cerrar</button>
          </div>
        </div>
      )}

      {isDeleteAllConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`${viewMode === 'addresses' ? 'bg-purple-300 border-purple-400' : 'bg-rose-300 border-rose-400'} p-6 rounded-2xl shadow-2xl max-sm w-full mx-4 border-2 font-bold`}>
            <p className={`${viewMode === 'addresses' ? 'text-purple-900' : 'text-rose-900'} font-bold text-lg mb-6 text-center uppercase`}>¿Desea realmente BORRAR TODOS os registros?</p>
            <div className="flex gap-4">
              <button onClick={() => { setAddresses([]); setPhones([]); setMaps([]); dataService.saveAddresses([]); dataService.savePhones([]); dataService.saveMaps([]); setIsDeleteAllConfirmOpen(false); }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition">Sí, Borrar Todo</button>
              <button onClick={() => setIsDeleteAllConfirmOpen(false)} className={`flex-1 bg-white border-2 ${viewMode === 'addresses' ? 'border-purple-900 text-purple-900' : 'border-rose-900 text-rose-900'} font-bold py-3 rounded-xl active:scale-95 transition`}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isAdminAlertOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-purple-300 p-6 rounded-2xl shadow-2xl max-sm w-full border-2 border-purple-400 text-center font-bold">
            <p className="text-purple-900 font-bold text-lg mb-6">Esta función solo está disponible para el administrador de la APP.</p>
            <button onClick={() => setIsAdminAlertOpen(false)} className="w-full bg-purple-900 text-white font-bold py-3 rounded-xl active:scale-95 transition shadow-lg">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
