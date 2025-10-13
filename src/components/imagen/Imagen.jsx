import './Imagen.scss';

const Imagen = ({ imagen, unknownImage, className }) => {
  return (
    <img
      src={imagen || unknownImage}
      className={`imagen-general ${className}`}
      alt="Tarjeta"
    ></img>
  );
};

export default Imagen;
