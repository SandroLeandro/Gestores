
import { Address, User, NeighborhoodMap, Phone } from '../types';

const STORAGE_KEYS = {
  USERS: 'gestor_usuarios',
  ADDRESSES: 'gestor_enderecos',
  MAPS: 'gestor_mapas',
  PHONES: 'gestor_telefonos'
};

export const dataService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  getAddresses: (): Address[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    return data ? JSON.parse(data) : [];
  },
  saveAddresses: (addresses: Address[]) => {
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
  },
  getMaps: (): NeighborhoodMap[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MAPS);
    return data ? JSON.parse(data) : [];
  },
  saveMaps: (maps: NeighborhoodMap[]) => {
    localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(maps));
  },
  getPhones: (): Phone[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PHONES);
    return data ? JSON.parse(data) : [];
  },
  savePhones: (phones: Phone[]) => {
    localStorage.setItem(STORAGE_KEYS.PHONES, JSON.stringify(phones));
  },
  getNextId: (list: any[]): number => {
    if (list.length === 0) return 1;
    const ids = new Set(list.map(a => Number(a.id)));
    let potentialId = 1;
    while (ids.has(potentialId)) {
      potentialId++;
    }
    return potentialId;
  }
};
