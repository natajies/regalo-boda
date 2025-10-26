import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../model/database/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import './Comentarios.scss';

const Comentarios = () => {
  const { id } = useParams();
  const { user } = useAuth();

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              user ? 'Escribe un comentario...' : 'Inicia sesión para comentar'
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
              disabled={!user || posting || newCommentText.trim().length === 0}
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
  );
};

export default Comentarios;

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
