// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Configuración pública de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC4-XBSzz-i2Ysn2E8ksiSuZRVWy-qDiWs",
  authDomain: "regaloerikflavia.firebaseapp.com",
  projectId: "regaloerikflavia",
  storageBucket: "regaloerikflavia.firebasestorage.app",
  messagingSenderId: "595601432633",
  appId: "1:595601432633:web:ce2903f80f651d17a96de8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Evento para mostrar notificaciones cuando la app está en background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // puedes cambiarlo por tu icono
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
