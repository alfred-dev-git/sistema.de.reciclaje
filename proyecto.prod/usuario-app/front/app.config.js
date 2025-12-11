import 'dotenv/config';

export default {
  expo: {
    name: "RecolectApp",
    slug: "recolectapp-user",

    icon: "./src/assets/logos/logo.png",

    android: {
      package: "com.recolectapp.recolector",
      adaptiveIcon: {
        foregroundImage: "./src/assets/logos/logo.png",
        backgroundColor: "#ffffff"
      }
    },

    extra: {
      expoPublicApiUrl: process.env.EXPO_PUBLIC_API_URL,
      expoPublicGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "2936fcf5-10c5-4e72-9541-0ac4a218e418"
      }
    }
  }
};
