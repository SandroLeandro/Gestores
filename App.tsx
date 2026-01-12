import React, { useState, useEffect } from 'react';
import { db, auth } from './src/services/Firebase';
import { collection, getDocs, query, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [setupForm, setSetupForm] = useState({ name: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      checkUsers();
    });

    const checkUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setIsSettingUp(true);
        }
      } catch (err) {
        console.error("Erro ao verificar banco:", err);
      }
      setLoading(false);
    };

    return () => unsubscribe();
  }, []);

  const handleSetup = async () => {
    if (!setupForm.name || !setupForm.password) return alert("Preencha todos os campos.");
    if (setupForm.password !== setupForm.confirmPassword) return alert("As senhas não conferem.");
    
    try {
      const email = "admin@admin.com";
      const res = await createUserWithEmailAndPassword(auth, email, setupForm.password);
      
      await setDoc(doc(db, 'users', res.user.uid), {
        name: setupForm.name,
        role: 'admin',
        email: email
      });
      
      alert("Sucesso! Usuário mestre criado: admin@admin.com");
      setIsSettingUp(false);
      window.location.reload();
    } catch (err: any) {
      alert("Erro no cadastro: " + err.message);
    }
  };

  if (loading) return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Carregando DirecTel...</h2>
    </div>
  );

  if (isSettingUp) return (
    <div style={{ padding: '40px', backgroundColor: '#4c1d95', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', color: '#4c1d95', marginTop: 0 }}>Configuração Inicial</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Crie seu acesso de Administrador:</p>
        
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Seu Nome:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          placeholder="Ex: Sandro" value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} />
        
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sua Senha:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          type="password" placeholder="Mínimo 6 dígitos" value={setupForm.password} onChange={e => setSetupForm({...setupForm, password: e.target.value})} />
        
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirme a Senha:</label>
        <input style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          type="password" placeholder="Repita a senha" value={setupForm.confirmPassword} onChange={e => setSetupForm({...setupForm, confirmPassword: e.target.value})} />
        
        <button onClick={handleSetup} style={{ width: '100%', padding: '15px', backgroundColor: '#4c1d95', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
          Criar Administrador
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#4c1d95' }}>¡Sistema DirecTel Online!</h1>
      <p>Bem-vindo, <strong>{user?.email}</strong>!</p>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '10px', display: 'inline-block' }}>
        <p>Aguarde, estou preparando sua lista de endereços...</p>
        <button onClick={() => auth.signOut()} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #4c1d95', background: 'white', color: '#4c1d95' }}>Sair</button>
      </div>
    </div>
  );
}