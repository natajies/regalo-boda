import './Botones.scss';

const BotonGenerico = ({ procesarClick, propiedades = {} }) => {
  return (
    <button
      className="tarjeta-content-links-btn-lugar pistas-linea-botones-iconos"
      onClick={() => procesarClick(propiedades)}
    />
  );
};

export default BotonGenerico;
