import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../model/database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import pistaPendiente from '../../assets/pista_pendiente.png'; // Importa la imagen por defecto
import Menu from '../menu';
import Imagen from '../imagen/Imagen';
import { BotonEstado, BotonGenerico } from '../botones';
import mostrarUbicacionPista from '../../model/features/mostrarUbicacionPista';

import './Clue.scss';
import Comentarios from './comentarios/Comentarios';

const Clue = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [clue, setClue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar los datos de la pista
  useEffect(() => {
    const fetchClue = async () => {
      try {
        const docRef = doc(db, 'pistas', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) setClue({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        setClue({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchClue();
  }, [id]);

  // Cargando
  if (loading)
    return (
      <div className="clue-container">
        <h1>Cargando...</h1>
      </div>
    );

  // En caso de no encontrar la pista
  if (!clue) {
    return (
      <div className="clue-container">
        <h1>No se encontró la pista</h1>
      </div>
    );
  }

  // Subir imagen en base64, reducir tamaño si es necesario
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Comprimir si hace falta
      const compressedBase64 = await compressImage(file);

      const clueRef = doc(db, 'pistas', String(id));
      await updateDoc(clueRef, { imagen: compressedBase64 });

      setClue((prev) => ({ ...prev, imagen: compressedBase64 }));
    } catch (error) {
      alert('Error al subir la imagen: ' + error.message);
    }
  };

  // Función para cambiar el estado de la pista
  const handleChangeClueStatus = async (newStatus) => {
    if (!clue) return;

    try {
      const clueRef = doc(db, 'pistas', clue.id);
      await updateDoc(clueRef, { estado: newStatus });

      // Actualizar estado local para refrescar la UI
      setClue((prev) => ({ ...prev, estado: newStatus }));
    } catch (error) {
      console.error(`Error al actualizar estado a ${newStatus}:`, error);
      alert(`No se pudo actualizar el estado: ${error.message}`);
    }
  };

  return (
    <div className="clue-mainContainer">
      <Menu
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        showArrowButton={true}
      />

      <div className="clue-container">
        {/* Título con el texto de la pista */}
        <h2 className="clue-header-title">{clue.adivinanza}</h2>

        {/* Opciones de la pista */}
        <div className="pista-linea-botones">
          {/* Estado */}
          <BotonEstado estado={clue.estado} />

          {/* Localización */}
          <div className="display-flex">
            <BotonGenerico
              procesarClick={mostrarUbicacionPista}
              propiedades={{ lugar: clue.lugar }}
            />
            <p className="pista-botones-texto">- {clue.lugar}</p>
          </div>

          {/* Subir imagen — solo visible para novios y estado Pendiente/Rechazada */}

          {user?.rol === 'Novios' &&
            (clue.estado === 'Rechazada' ||
              (clue.estado === 'Pendiente' && !clue.imagen)) && (
              <div className="display-flex">
                <button
                  className="pista-linea-botones-iconos pista-linea-botones-subir-foto"
                  onClick={() => document.getElementById('fileInput').click()}
                />
                <p className="pista-botones-texto">&nbsp;- Subir foto</p>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e)}
                />
              </div>
            )}

          {/* Aprobar/Rechazar — solo visible para admin y estado Pendiente con imagen */}
          {user?.rol === 'admin' &&
            ((clue.estado === 'Pendiente' && clue.imagen) ||
              clue.estado === 'Rechazada') && (
              <div className="display-flex">
                <button
                  className="pista-linea-botones-iconos pista-linea-botones-aprobar"
                  onClick={() => handleChangeClueStatus('Completada')}
                />
                <p className="pista-botones-texto">&nbsp;- Aprobar</p>
              </div>
            )}

          {/* Rechazar — solo visible para admin y estado Pendiente con imagen */}
          {user?.rol === 'admin' &&
            ((clue.estado === 'Pendiente' && clue.imagen) ||
              clue.estado === 'Rechazada') && (
              <div className="display-flex">
                <button
                  className="pista-linea-botones-iconos pista-linea-botones-rechazar"
                  onClick={() => handleChangeClueStatus('Rechazada')}
                />
                <p className="pista-botones-texto">&nbsp;- Rechazar</p>
              </div>
            )}
        </div>

        {/* Imagen por defecto si no se ha subido y la subida en caso contrario */}
        <div className="clue-picture">
          <Imagen imagen={clue.imagen} unknownImage={pistaPendiente} />
        </div>

        {/* Comentarios */}
        <Comentarios />
      </div>
    </div>
  );
};

export default Clue;

/**
 * Reduce una imagen hasta que su tamaño en base64 sea menor al límite dado.
 * Devuelve una promesa con el base64 reducido.
 */
function compressImage(file, maxBytes = 900 * 1024, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Redimensionar proporcionalmente
        let width = img.width;
        let height = img.height;

        // Reducimos tamaño máximo para que no pese tanto
        const maxDimension = 1280;
        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convertimos a base64 con calidad reducida
        let base64 = canvas.toDataURL('image/jpeg', quality);

        // Si sigue siendo demasiado grande, vamos bajando calidad en bucle
        while (base64.length > maxBytes * 1.37 && quality > 0.4) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(base64);
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
