import React, { useState, useEffect } from 'react';
import { db, auth } from './src/services/Firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export default function App() {
  const [status, setStatus] = useState('Conectando ao Firebase...');

  useEffect(() => {
    const testFirebase = async () => {
      try {
        const q = query(collection(db, 'users'));
        await getDocs(q);
        setStatus('✅ Conectado com Sucesso! Firebase OK.');
      } catch (err: any) {
        setStatus('❌ Erro de Conexão: ' + err.message);
      }
    };
    testFirebase();
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Teste de Sistema - Sandro</h1>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <p>{status}</p>
      </div>
    </div>
  );
}