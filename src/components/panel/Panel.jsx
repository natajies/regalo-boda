import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../model/database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Tarjeta from './Tarjeta';
import Menu from '../menu';

import './Panel.scss';

const Panel = () => {
  const [clues, setClues] = useState([]);
  const { user } = useAuth();
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

  return (
    <div className="panel-container">
      <Menu photoURL={user?.photoURL} displayName={user?.displayName} />

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
