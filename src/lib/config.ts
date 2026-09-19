export const appConfig = {
  prismicRepository: import.meta.env.VITE_PRISMIC_REPOSITORY || "play-gba-web",
  prismicAccessToken: import.meta.env.VITE_PRISMIC_ACCESS_TOKEN || "",
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  },
};

export const firebaseConfigured = [
  appConfig.firebase.apiKey,
  appConfig.firebase.authDomain,
  appConfig.firebase.projectId,
  appConfig.firebase.messagingSenderId,
  appConfig.firebase.appId,
].every(Boolean);
