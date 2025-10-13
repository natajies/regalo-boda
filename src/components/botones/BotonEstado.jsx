import './Botones.scss';

const BotonEstado = ({ estado }) => {
  const clueStatusClass =
    estado === 'Pendiente'
      ? 'btn-amarillo'
      : estado === 'Rechazada'
        ? 'btn-rojo'
        : 'btn-verde';

  return (
    <span className={`btn-generico btn-estado ${clueStatusClass}`}>
      {estado || 'No disponible'}
    </span>
  );
};

export default BotonEstado;
