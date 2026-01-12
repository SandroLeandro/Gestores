import React, { useState, useEffect } from 'react';
import { db, auth } from './src/services/Firebase';
import { collection, getDocs, query, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupForm, setSetupForm] = useState({ name: '', password: '', confirmPassword: '' });

  // 1. Função que estava faltando e causava o erro:
  const handleSetup = async () => {
    if (!setupForm.name || !setupForm.password) return alert("Por favor, preencha todos os campos.");
    if (setupForm.password !== setupForm.confirmPassword) return alert("As senhas não coincidem.");
    
    try {
      // Criamos um usuário padrão para o primeiro acesso
      const res = await createUserWithEmailAndPassword(auth, "admin@admin.com", setupForm.password);
      await setDoc(doc(db, 'users', res.user.uid), {
        name: setupForm.name,
        role: 'admin',
        email: "admin@admin.com"
      });
      setIsSettingUp(false);
      alert("¡Administrador creado con éxito!");
    } catch (err: any) {
      alert("Erro no setup: " + err.message);
    }
  };

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setIsSettingUp(true);
        }
      } catch (err) {
        console.error("Erro ao conectar com Firebase:", err);
      }
      setLoading(false);
    };
    checkUsers();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <h2>Cargando conexión con Firebase...</h2>
    </div>
  );

  if (isSettingUp) return (
    <div style={{ padding: '40px', backgroundColor: '#4c1d95', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', color: '#333', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ color: '#4c1d95', textAlign: 'center' }}>Configuración Inicial</h2>
        <p style={{ fontSize: '14px' }}>Cree su cuenta de Administrador:</p>
        
        <input style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} 
          placeholder="Su Nombre" value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} />
        
        <input style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} 
          type="password" placeholder="Contraseña" value={setupForm.password} onChange={e => setSetupForm({...setupForm, password: e.target.value})} />
        
        <input style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc' }} 
          type="password" placeholder="Confirmar Contraseña" value={setupForm.confirmPassword} onChange={e => setSetupForm({...setupForm, confirmPassword: e.target.value})} />
        
        <button onClick={handleSetup} style={{ width: '100%', padding: '15px', backgroundColor: '#4c1d95', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          Crear Administrador
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#4c1d95' }}>¡Sistema Online!</h1>
      <p>El Firebase está conectado y funcionando.</p>
    </div>
  );
}