import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../model/database/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './Login.scss';

const Login = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Firebase Auth actualizará automáticamente el contexto
      navigate('/panel');
    } catch (error) {
      setMessage('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <button onClick={handleLogin}>Ingresar</button>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Login;
