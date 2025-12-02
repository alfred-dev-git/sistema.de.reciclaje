import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";
import axios from "axios";

const router = Router();

/**
 * GET /api/users/:id/addresses
 * Devuelve { addresses: [{ id, usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias }]}
 * Nota: id = iddirecciones (aliased como id)
 */
router.get(
  "/users/:id/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: "userId inválido" });

    const db = getDB();
    const [rows] = await db.query(
      `SELECT
         iddirecciones AS id,
         usuario_idusuario,
         latitud, longitud, calle, numero, barrio, referencias
       FROM direcciones
       WHERE usuario_idusuario = ?`,
      [userId]
    );
    res.json({ addresses: rows });
  })
);

/**
 * POST /api/addresses
 * Body: { usuario_idusuario, latitud, longitud, calle?, numero?, barrio?, referencias? }
 * Devuelve: { id }  // id = insertId = iddirecciones
 */
router.post(
  "/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      usuario_idusuario, latitud, longitud,
      calle = null, numero = null, barrio = null, referencias = null
    } = req.body || {};

    if (!usuario_idusuario || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ error: "Faltan campos: usuario_idusuario, latitud, longitud" });
    }

    const db = getDB();

    // validar usuario existe
    const [[user]]: any = await db.query(
      `SELECT idusuario FROM usuario WHERE idusuario = ?`,
      [usuario_idusuario]
    );
    if (!user) return res.status(400).json({ error: "usuario_idusuario inexistente" });

    const [result] = await db.execute(
      `INSERT INTO direcciones (usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias]
    );
    const insertId = (result as any).insertId; // este es iddirecciones

    res.status(201).json({ id: insertId });
  })
);

/**
 * GET /api/addresses/google/autocomplete?input=...
 * Llama a Google Places Autocomplete y devuelve predictions
 */
router.get(
  "/addresses/google/autocomplete",
  asyncHandler(async (req: Request, res: Response) => {
    console.log("LLEGUE A GOOGLE");
    const input = String(req.query.input ?? "");
    if (!input.trim()) {
      return res.json({ predictions: [] });
    }

    const KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!KEY) {
      console.error("GOOGLE_MAPS_API_KEY missing en .env");
      return res.status(500).json({ error: "Google API key missing" });
    }

    const url =
      "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
      `?input=${encodeURIComponent(input)}` +
      "&types=address" +
      "&language=es" +
      "&components=country:ar" +
      `&key=${KEY}`;

    try {
      const response = await axios.get(url);
      return res.json(response.data);
    } catch (error: any) {
      console.error("Error Google Places:", error?.response?.data || error?.message);
      return res.status(500).json({ error: "Failed Google request" });
    }
  })
);

//PARA GEOCODING DE DIRECCIONES en produccion
// router.get(
//   "/addresses/google/geocode",
//   asyncHandler(async (req, res) => {
//     const address = String(req.query.address ?? "");
//     if (!address.trim()) return res.status(400).json({ error: "Address missing" });

//     const KEY = process.env.GOOGLE_MAPS_API_KEY;

//     const url =
//       "https://maps.googleapis.com/maps/api/geocode/json" +
//       `?address=${encodeURIComponent(address)}` +
//       `&key=${KEY}`;

//     try {
//       const response = await axios.get(url);
//       return res.json(response.data);
//     } catch (err) {
//       return res.status(500).json({ error: "Failed Google request" });
//     }
//   })
// );


export default router;
