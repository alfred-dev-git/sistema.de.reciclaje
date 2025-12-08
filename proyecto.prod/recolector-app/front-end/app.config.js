import 'dotenv/config';

export default {
  expo: {
    name: "RecolectorApp",
    slug: "recolectapp-recolector",
    android: {
      package: "com.recolectapp.recolector"
   },
    extra: {
      apiUrl: process.env.API_URL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
     eas: {
        projectId: "70328863-4493-46f7-9e44-fd1dba42ab1d"
      }
    }
  }
};
