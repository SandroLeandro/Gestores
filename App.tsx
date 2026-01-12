import React, { useState, useEffect } from 'react';
import { db, auth } from './src/services/Firebase';
import { collection, getDocs, query, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupForm, setSetupForm] = useState({ name: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) setIsSettingUp(true);
      } catch (err) {
        console.error("Erro Firebase:", err);
      }
      setLoading(false);
    };
    checkUsers();
  }, []);

  const handleSetup = async () => {
    if (setupForm.password !== setupForm.confirmPassword) return alert("Senhas diferentes");
    try {
      const res = await createUserWithEmailAndPassword(auth, "admin@admin.com", setupForm.password);
      await setDoc(doc(db, 'users', res.user.uid), { name: setupForm.name, role: 'admin' });
      setIsSettingUp(false);
      alert("Admin criado!");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Cargando conexión con Firebase...</div>;

  if (isSettingUp) return (
    <div style={{padding: '20px', background: '#f3e8ff', minHeight: '100vh'}}>
      <h2>Configuración Inicial</h2>
      <input placeholder="Nombre" onChange={e => setSetupForm({...setupForm, name: e.target.value})} /><br/><br/>
      <input type="password" placeholder="Contraseña" onChange={e => setSetupForm({...setupForm, password: e.target.value})} /><br/><br/>
      <input type="password" placeholder="Confirmar" onChange={e => setSetupForm({...setupForm, confirmPassword: e.target.value})} /><br/><br/>
      <button onClick={handleSetup}>Crear Administrador</button>
    </div>
  );

  return <div style={{padding: '20px'}}><h1>¡Conectado!</h1><p>El sistema base funciona. Ahora podemos reativar los componentes.</p></div>;
}