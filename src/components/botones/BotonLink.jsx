import { Link } from 'react-router-dom';

import './Botones.scss';

const BotonLink = ({ id }) => {
  return (
    <Link
      to={`/pista/${id}`}
      className="btn-generico tarjeta-content-links-vermas"
    >
      Ver más
    </Link>
  );
};

export default BotonLink;
