import { Link } from 'react-router-dom';
import unknownImage from '../../../assets/unknown.png';

import './Tarjeta.scss';
import Imagen from '../../imagen/Imagen';

const Tarjeta = ({ imagen, adivinanza, estado, lugar, id }) => {
  const clueStatusClass =
    estado === 'Pendiente'
      ? 'btn-amarillo'
      : estado === 'Rechazada'
        ? 'btn-rojo'
        : 'btn-verde';

  const handleLocationClick = (lugar) => {
    if (!lugar || lugar === 'N/A') {
      alert('No hay ubicación disponible para esta pista');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;

    window.open(mapsUrl, '_blank');
  };

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
          <span className={`btn-generico ${clueStatusClass}`}>
            {estado || 'No disponible'}
          </span>
        </li>
        <li className="tarjeta-content-lista-elem">
          <span>Lugar:</span>
          <span>{lugar || 'No disponible'}</span>
        </li>
      </ul>
      <div className="tarjeta-content-links">
        <button
          className="tarjeta-content-links-btn-lugar pistas-linea-botones-iconos pistas-linea-botones-subir-foto"
          onClick={() => handleLocationClick(lugar)}
        />
        <Link
          to={`/pista/${id}`}
          className="btn-generico tarjeta-content-links-vermas"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
};

export default Tarjeta;
