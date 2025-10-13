const Imagen = ({ pistas }) => {
  const calcularProgreso = () => {
    if (pistas.length > 0) {
      return Math.round(
        (pistas.filter((clue) => clue.estado === 'Completada').length / 24) *
          100,
      );
    }
    return 0;
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Progreso de Pistas</h3>
        <span className="progress-percentage">{calcularProgreso()}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${calcularProgreso()}%` }}
        ></div>
      </div>
      <div className="progress-stats">
        <span>
          {pistas.filter((clue) => clue.estado === 'Completada').length} de{' '}
          {pistas.length} pistas completadas
        </span>
      </div>
    </div>
  );
};

export default Imagen;
