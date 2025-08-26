import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

// Create Context
const AppContext = createContext();

//  Firebase Config (replace with your Firebase credentials in future)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

let messaging = null;
(async () => {
  try {
    const supported = await isSupported();
    if (supported && firebaseConfig.apiKey) {
      const firebaseApp = initializeApp(firebaseConfig);
      messaging = getMessaging(firebaseApp);
    } else {
      console.warn("Firebase Messaging not supported or config missing.");
    }
  } catch (err) {
    console.warn("Firebase init skipped:", err.message);
  }
})();

export const AppProvider = ({ children }) => {
  // Auth state
  const [authToken, setAuthToken] = useState(null);

  // Firebase notification state
  const [fcmToken, setFcmToken] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load saved auth token from localStorage on start
  useEffect(() => {
    const savedAuth = localStorage.getItem("authToken");
    if (savedAuth) setAuthToken(savedAuth);
  }, []);

  // Save auth token changes to localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [authToken]);

  const login = (token) => setAuthToken(token);
  const logout = () => setAuthToken(null);

  // Request Firebase notification permission
  const requestNotificationPermission = async () => {
    try {
      const supported = await isSupported();
      if (!supported || !messaging) {
        console.warn("Notifications not supported in this environment.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "",
          serviceWorkerRegistration: registration,
        });

        console.log("FCM Token:", token);
        setFcmToken(token);
      } else {
        console.warn("Notification permission not granted.");
      }
    } catch (err) {
      console.error("Error getting FCM token:", err);
    }
  };

  // Listen for foreground notifications
  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      const supported = await isSupported();
      if (!supported || !messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground notification:", payload);
        if (payload?.notification) {
          setNotifications((prev) => [...prev, payload.notification]);
        }
      });
    })();

    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{
        // Auth
        authToken,
        login,
        logout,
        // Notifications
        fcmToken,
        requestNotificationPermission,
        notifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
