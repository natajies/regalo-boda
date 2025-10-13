import unknownImage from '../../../assets/unknown.png';
import Imagen from '../../imagen/Imagen';
import { BotonEstado, BotonLink, BotonGenerico } from '../../botones';
import mostrarUbicacionPista from '../../../model/features/mostrarUbicacionPista';

import './Tarjeta.scss';

const Tarjeta = ({ imagen, adivinanza, estado, lugar, id }) => {
  return (
    <div className="tarjeta-content">
      <Imagen
        imagen={imagen}
        unknownImage={unknownImage}
        className="tarjeta-content-image"
      />
      <div className="tarjeta-content-adivinanza">
        <p className="tarjeta-content-adivinanza-text">
          {adivinanza || 'No disponible'}
        </p>
      </div>
      <ul className="tarjeta-content-lista">
        <li className="tarjeta-content-lista-elem">
          <span>Estado:</span>
          <BotonEstado estado={estado} />
        </li>
        <li className="tarjeta-content-lista-elem">
          <span>Lugar:</span>
          <span>{lugar || 'No disponible'}</span>
        </li>
      </ul>
      <div className="tarjeta-content-links">
        <BotonGenerico
          procesarClick={mostrarUbicacionPista}
          propiedades={{ lugar }}
        />
        <BotonLink id={id} />
      </div>
    </div>
  );
};

export default Tarjeta;
