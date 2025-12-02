import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRouter from "@/routes";
import { errorMiddleware } from "@/middlewares/error";

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    process.env.CORS_ORIGIN // tu dominio en producción
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Origen no permitido por CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorMiddleware);

export default app;
