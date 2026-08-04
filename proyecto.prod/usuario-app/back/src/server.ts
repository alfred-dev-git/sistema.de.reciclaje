import app from "./app";
import "dotenv/config";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
