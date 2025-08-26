import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Create Context
const AppContext = createContext();

//  Firebase Config (replace with your Firebase credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

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

  const login = (token) => {
    setAuthToken(token);
  };

  const logout = () => {
    setAuthToken(null);
  };

  // Request Firebase notification permission
  const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      //  First register the service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      //  Then get the FCM token with service worker
      const token = await getToken(messaging, {
        vapidKey: "YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR",
        serviceWorkerRegistration: registration,
      });

      console.log("FCM Token:", token);
      setFcmToken(token);

      // TODO: Later send this token to backend linked with authToken
    } else {
      console.warn("Notification permission not granted.");
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};


  // Listen for foreground notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground notification:", payload);
      setNotifications((prev) => [...prev, payload.notification]);
    });
    return unsubscribe;
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
