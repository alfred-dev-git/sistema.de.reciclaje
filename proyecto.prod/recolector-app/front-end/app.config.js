import 'dotenv/config';

export default {
  expo: {
    name: "RecolectorApp",
    slug: "recolectapp-recolector",

    // 🔹 ICONO GENERAL
    icon: "./assets/logos/logo.png",

    // 🔹 SPLASH
    splash: {
      image: "./assets/logos/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    android: {
      package: "com.recolectapp.recolector",

      // 🔹 ICONO ANDROID
      adaptiveIcon: {
        foregroundImage: "./assets/logos/logo.png",
        backgroundColor: "#ffffff",
      },

      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    ios: {
      supportsTablet: true,
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "70328863-4493-46f7-9e44-fd1dba42ab1d",
      },
    },
  },
};
