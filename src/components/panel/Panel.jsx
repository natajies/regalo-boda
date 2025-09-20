import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Panel.scss';
import { db } from '../../model/database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const Panel = () => {
  const [clues, setClues] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Usuario actual:', user);
    console.log('Usuario UID:', user?.uid);
    console.log('Usuario autenticado:', !!user);

    if (!user) {
      console.log('No hay usuario, redirigiendo a login...');
      navigate('/login');
      return;
    }

    const fetchClues = async () => {
      try {
        console.log('Intentando obtener pistas...');
        console.log('Base de datos configurada:', !!db);

        // Intentar acceso con reglas más permisivas
        const cluesCollection = await getDocs(collection(db, 'pistas'));
        console.log('Pistas obtenidas:', cluesCollection.docs.length);
        setClues(
          cluesCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } catch (error) {
        console.error('Error completo:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);

        // Mostrar el error al usuario
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
      <h1 className="panel-title">Panel de Pistas</h1>
      <div className="panel-content">
        <div className="pistas">
          {clues.map((clue) => (
            <div className="pistas-linea" key={clue.id}>
              <div className="pistas-linea-botones">
                <button onClick={() => {}}>Estado</button>
                <button onClick={() => {}}>Localización</button>
                <button onClick={() => {}}>Subir foto</button>
              </div>
              <div className="pistas-linea-texto">{clue.adivinanza}</div>
              <div className="pistas-linea-botones-pequeños">
                <Link to={`/pista/${clue.id}`} className="pista-link">
                  Ver Pista
                </Link>
              </div>
              <div className="pistas-linea-botones-info">
                <ul>
                  <li>Lugar: {clue.lugar}</li>
                  <li>Ayuda: {clue.ayuda}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Panel;
