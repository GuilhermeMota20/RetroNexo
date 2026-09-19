import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebaseAuth: ["firebase/auth"],
          firebaseData: ["firebase/firestore"],
          forms: ["react-hook-form", "@hookform/resolvers", "yup"],
        },
      },
    },
  },
});
