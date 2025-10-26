import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../model/database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Tarjeta from './tarjeta';
import ProgresoPistas from './progreso';
import Menu from '../menu';

import './Panel.scss';

const Panel = () => {
  const [clues, setClues] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroLugar, setFiltroLugar] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

  const lugaresPistas = [...new Set(clues.map((clue) => clue.lugar))];

  return (
    <div className="panel-container">
      <Menu photoURL={user?.photoURL} displayName={user?.displayName} />
      <ProgresoPistas pistas={clues} />

      <div className="panel-container-filtros">
        <div
          className={`panel-container-filtros-flecha arrow ${mostrarFiltros ? 'arrow-up' : 'arrow-down'}`}
          onClick={() => setMostrarFiltros((v) => !v)}
        />
        {mostrarFiltros && (
          <form>
            <label>
              Lugar:
              <select
                value={filtroLugar}
                onChange={(e) => setFiltroLugar(e.target.value)}
              >
                <option value="">Todos</option>
                {lugaresPistas.map((lugar) => (
                  <option key={lugar} value={lugar}>
                    {lugar}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado:
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </label>
          </form>
        )}
      </div>
      <div className="panel-content">
        <div className="pistas">
          {clues
            .filter(
              (clue) =>
                (!filtroEstado || clue.estado === filtroEstado) &&
                (!filtroLugar || clue.lugar === filtroLugar),
            )
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
