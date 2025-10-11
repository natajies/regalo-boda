import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Panel.scss';
import { db } from '../../model/database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Tarjeta from './Tarjeta';

const Panel = () => {
  const [clues, setClues] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const calculateProgress = () => {
    if (clues.length === 0) return 0;
    const completedClues = clues.filter(
      (clue) => clue.estado === 'Completada',
    ).length;
    return Math.round((completedClues / 24) * 100);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchClues = async () => {
      try {
        const cluesCollection = await getDocs(collection(db, 'pistas'));
        setClues(
          cluesCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } catch (error) {
        setClues([
          {
            id: 'error',
            adivinanza: `Error: ${error.message}`,
            lugar: 'N/A',
            ayuda: `Código: ${error.code}`,
          },
        ]);
      }
    };

    fetchClues();
  }, [user, navigate]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-infouser')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUserMenuClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <div className="panel-container">
      <div className="menu">
        <div className="menu-infouser" onClick={handleUserMenuClick}>
          <div className="menu-infouser-foto">
            {user?.photoURL && <img src={user.photoURL} alt="User" />}
          </div>
          <div className="menu-infouser-nombre">
            {user && user.displayName ? user.displayName : 'Usuario'}
          </div>
          <div className="menu-infouser-arrow">
            <div
              className={`arrow ${showDropdown ? 'arrow-up' : 'arrow-down'}`}
            />
          </div>
        </div>

        {/* Menú desplegable */}
        {showDropdown && (
          <div className="menu-dropdown">
            <div className="menu-dropdown-item logout" onClick={handleLogout}>
              Cerrar Sesión
            </div>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="progress-container">
        <div className="progress-header">
          <h3>Progreso de Pistas</h3>
          <span className="progress-percentage">{calculateProgress()}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>
            {clues.filter((clue) => clue.estado === 'Completada').length} de{' '}
            {clues.length} pistas completadas
          </span>
        </div>
      </div>

      <div className="panel-content">
        <div className="pistas">
          {clues
            .sort((a, b) => {
              const ordenar = ['Rechazada', 'Pendiente', 'Completada'];
              return ordenar.indexOf(a.estado) - ordenar.indexOf(b.estado);
            })
            .map((clue) => {
              return (
                <div className="pistas-linea" key={clue.id}>
                  <Tarjeta
                    imagen={clue.imagen}
                    adivinanza={clue.adivinanza}
                    estado={clue.estado}
                    lugar={clue.lugar}
                    id={clue.id}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Panel;
