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
      navigate('/panel');
    } catch (error) {
      setMessage('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div className="login">
      <div className="login-form">
        <div className="login-form-logo" />
        <div className="login-form-text">
          Bienvenid@s al principio de esta nueva aventura, aqui cada pista es un
          hilo rojo que os conectará con momentos mágicos. Inicia sesión y
          descubre los destinos que os llevarán a crear recuerdos inolvidables
          juntos.
        </div>
        <div onClick={handleLogin} className="login-form-button">
          <div className="login-form-button-icon" />
          <div className="login-form-button-text">Continuar con Google</div>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Login;
