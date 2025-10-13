import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../model/database/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import pistaPendiente from '../../assets/pista_pendiente.png'; // Importa la imagen por defecto
import Menu from '../menu';
import Imagen from '../imagen/Imagen';
import { BotonEstado, BotonGenerico } from '../botones';
import mostrarUbicacionPista from '../../model/features/mostrarUbicacionPista';

import './Clue.scss';

const Clue = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [clue, setClue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comentarios
  const [comments, setComments] = useState([]); // lista de comentarios
  const [newCommentText, setNewCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const comentariosCollectionRef = collection(
    db,
    'pistas',
    String(id),
    'comentarios',
  );

  useEffect(() => {
    console.log(user?.rol);
    setCommentsLoading(true);
    const q = query(comentariosCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const datos = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setComments(datos);
        setCommentsLoading(false);
      },
      (error) => {
        console.error('Error al leer comentarios:', error);
        setCommentsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

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

  // Función para gestionar los comentarios
  const handlePostComment = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    const text = newCommentText.trim();
    if (!text) return;

    setPosting(true);
    try {
      await addDoc(comentariosCollectionRef, {
        text,
        authorName: user.displayName || 'Usuario',
        authorPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setNewCommentText('');
      // No hace falta recargar: onSnapshot actualiza automáticamente
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      alert('Error al publicar comentario: ' + error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ height: '100vh', overflowY: 'auto' }}>
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
            clue.estado === 'Pendiente' &&
            clue.imagen && (
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
            clue.estado === 'Pendiente' &&
            clue.imagen && (
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

        {/* COMENTARIOS */}
        <section className="clue-comments">
          <h3 className="comments-title">Comentarios</h3>

          {/* Caja de nuevo comentario */}
          <div className="comment-box-new">
            <div className="comment-box-left">
              <img
                src={user?.photoURL || '/default-user.png'}
                alt={user?.displayName || 'Usuario'}
                className="comment-author-photo"
              />
            </div>

            <div className="comment-box-right">
              <textarea
                className="comment-textarea"
                placeholder={
                  user
                    ? 'Escribe un comentario...'
                    : 'Inicia sesión para comentar'
                }
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                disabled={!user || posting}
                rows={3}
              />
              <div className="comment-actions">
                <button
                  className="btn btn-comment"
                  onClick={handlePostComment}
                  disabled={
                    !user || posting || newCommentText.trim().length === 0
                  }
                >
                  {posting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de comentarios */}
          <div className="comments-list">
            {commentsLoading ? (
              <p className="comments-loading">Cargando comentarios...</p>
            ) : comments.length === 0 ? (
              <p className="no-comments">Sé el primero en comentar ✨</p>
            ) : (
              comments.map((c) => (
                <article key={c.id} className="comment-item">
                  <div className="comment-item-left">
                    <img
                      src={c.authorPhoto || '/default-user.png'}
                      alt={c.authorName || 'Usuario'}
                      className="comment-author-photo"
                    />
                  </div>
                  <div className="comment-item-right">
                    <div className="comment-meta">
                      <span className="comment-author-name">
                        {c.authorName || 'Usuario'}
                      </span>
                      <span className="comment-date">
                        {formatTimestamp(c.createdAt)}
                      </span>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
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

function formatTimestamp(ts) {
  if (!ts) return ''; // durante unos ms puede llegar null
  // ts puede ser Timestamp (firebase) o un objeto con toDate()
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return '';
  }
}
