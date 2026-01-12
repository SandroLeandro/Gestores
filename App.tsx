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
        // Se não houver nenhum usuário, libera o Setup
        if (snapshot.empty) {
          setIsSettingUp(true);
        }
      } catch (err) {
        console.error("Erro ao verificar usuários:", err);
      }
      setLoading(false);
    };
    checkUsers();
  }, []);

  const handleSetup = async () => {
    if (!setupForm.name || !setupForm.password) return alert("Preencha todos os campos");
    if (setupForm.password !== setupForm.confirmPassword) return alert("As senhas não coincidem");
    
    try {
      // Criando o usuário no Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, "admin@admin.com", setupForm.password);
      
      // Salvando os dados no Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        name: setupForm.name,
        role: 'admin',
        email: "admin@admin.com"
      });
      
      setIsSettingUp(false);
      alert("¡Administrador creado con éxito! Ahora recarga la página.");
      window.location.reload();
    } catch (err: any) {
      alert("Erro no setup: " + err.message);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #4c1d95', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p>Conectando ao Firebase...</p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isSettingUp) return (
    <div style={{ padding: '40px', backgroundColor: '#4c1d95', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', color: '#333', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ color: '#4c1d95', textAlign: 'center', marginTop: 0 }}>Configuración Inicial</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Crie seu acesso de Administrador</p>
        
        <label>Seu Nome:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          placeholder="Ex: Sandro Leandro" value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} />
        
        <label>Sua Senha:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          type="password" placeholder="Mínimo 6 caracteres" value={setupForm.password} onChange={e => setSetupForm({...setupForm, password: e.target.value})} />
        
        <label>Confirme a Senha:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          type="password" placeholder="Repita a senha" value={setupForm.confirmPassword} onChange={e => setSetupForm({...setupForm, confirmPassword: e.target.value})} />
        
        <button onClick={handleSetup} style={{ width: '100%', padding: '15px', backgroundColor: '#4c1d95', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
          Crear Administrador
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#4c1d95' }}>¡Sistema Online!</h1>
      <p>Você já criou o administrador. O próximo passo é liberar a lista de endereços.</p>
      <button onClick={() => auth.signOut()} style={{ padding: '10px 20px', cursor: 'pointer' }}>Sair do Sistema</button>
    </div>
  );
}