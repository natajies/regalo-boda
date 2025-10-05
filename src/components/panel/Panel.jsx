import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Panel.scss';
import { db } from '../../model/database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

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
    return Math.round((completedClues / clues.length) * 100);
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

  const handleLocationClick = (lugar) => {
    if (!lugar || lugar === 'N/A') {
      alert('No hay ubicación disponible para esta pista');
      return;
    }

    // Construir la URL de Google Maps con la ubicación
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;

    // Abrir en nueva pestaña
    window.open(mapsUrl, '_blank');
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
          {clues.map((clue) => {
            const clueStatusClass =
              clue.estado === 'Pendiente'
                ? 'btn-amarillo'
                : clue.estado === 'Rechazada'
                  ? 'btn-rojo'
                  : 'btn-verde';
            return (
              <div className="pistas-linea" key={clue.id}>
                <div className="pistas-linea-botones">
                  <div
                    className={`btn-generico pistas-linea-botones-estado ${clueStatusClass}`}
                  >
                    {clue.estado}
                  </div>
                  <button
                    className="pistas-linea-botones-iconos pistas-linea-botones-localizacion"
                    onClick={() => handleLocationClick(clue.lugar)}
                    title={`Abrir ubicación: ${clue.lugar || 'No disponible'}`}
                  />
                  <button
                    className="pistas-linea-botones-iconos pistas-linea-botones-subir-foto"
                    onClick={() => {}}
                  />
                  <div className="btn-generico pistas-linea-botones-vermas">
                    <Link to={`/pista/${clue.id}`} className="pista-link">
                      Ver más
                    </Link>
                  </div>
                </div>
                <div className="pistas-linea-texto">{clue.adivinanza}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Panel;
