import 'dotenv/config';

export default {
  expo: {
    name: "RecolectorApp",
    slug: "recolectapp-recolector",

    icon: "./assets/icon.png",

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    android: {
      package: "com.recolectapp.recolector",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },

    ios: {
      supportsTablet: true,
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    plugins: ["expo-secure-store"],

    extra: {
      apiUrl: process.env.API_URL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "70328863-4493-46f7-9e44-fd1dba42ab1d",
      },
    },
  },
};
