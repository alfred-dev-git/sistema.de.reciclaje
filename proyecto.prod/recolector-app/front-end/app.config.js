import 'dotenv/config';

export default {
  expo: {
    name: "Re-colecta-App",
    slug: "Re-colecta-App",
    extra: {
      apiUrl: process.env.API_URL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    }
  }
};
