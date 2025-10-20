import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRouter from "@/routes";
import { errorMiddleware } from "@/middlewares/error";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorMiddleware);

export default app;
