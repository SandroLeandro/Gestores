import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc,
  serverTimestamp
} from "firebase/firestore";

// TODO: Cole aqui os SEUS dados do console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-UjpSP01Sy_h0yt_XFqAWYmlp7A2HW9E",
  authDomain: "directel.firebaseapp.com",
  projectId: "directel",
  storageBucket: "directel.firebasestorage.app",
  messagingSenderId: "322411220682",
  appId: "1:322411220682:web:241900ee0bb2a01db2ee33"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- FUNÇÕES DE COMUNICAÇÃO EM TEMPO REAL ---

// Escuta endereços
export const streamAddresses = (callback: (data: any[]) => void) => {
  const q = query(collection(db, "addresses"), orderBy("bairro", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// Escuta telefones
export const streamPhones = (callback: (data: any[]) => void) => {
  const q = query(collection(db, "phones"), orderBy("data", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// Salva ou Atualiza Endereço
export const saveAddress = async (address: any) => {
  if (address.id) {
    const { id, ...data } = address;
    return await updateDoc(doc(db, "addresses", id), { ...data, updatedAt: serverTimestamp() });
  }
  return await addDoc(collection(db, "addresses"), { ...address, createdAt: serverTimestamp() });
};

// Salva ou Atualiza Telefone
export const savePhone = async (phone: any) => {
  if (phone.id) {
    const { id, ...data } = phone;
    return await updateDoc(doc(db, "phones", id), { ...data, updatedAt: serverTimestamp() });
  }
  return await addDoc(collection(db, "phones"), { ...phone, createdAt: serverTimestamp() });
};