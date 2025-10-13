const mostrarUbicacionPista = ({ lugar }) => {
  if (!lugar || lugar === 'N/A') {
    alert('No hay ubicación disponible para esta pista');
    return;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;

  window.open(mapsUrl, '_blank');
};

export default mostrarUbicacionPista;
