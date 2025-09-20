import React from 'react';
import { useParams } from 'react-router-dom';
import './Clue.scss';

const clues = {
  1: 'Pista 1: Visita el templo Senso-ji en Asakusa.',
  2: 'Pista 2: Disfruta de la vista desde la Torre de Tokio.',
  3: 'Pista 3: Explora el mercado de Tsukiji.',
  // Agrega más pistas según sea necesario
};

const Clue = () => {
  const { id } = useParams();
  const clueContent = clues[id] || 'Pista no encontrada.';

  return (
    <div className="clue-container">
      <h1>Pista {id}</h1>
      <p>{clueContent}</p>
    </div>
  );
};

export default Clue;