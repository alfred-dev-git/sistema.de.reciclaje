import { Router, Request, Response } from "express";
import asyncHandler from "@/utils/asyncHandler";
import getDB from "@/config/db";
import { requireAuth } from "@/middlewares/auth";

const router = Router();
router.use(requireAuth);

function ensureSelf(req: Request, res: Response) {
  if (Number(req.params.id) !== req.user!.uid) {
    res.status(403).json({ error: "No podés acceder a otro usuario" });
    return false;
  }
  return true;
}

function sexoToDb(value: unknown) {
  return ({ M: 1, F: 2, O: 3 } as Record<string, number>)[String(value).toUpperCase()] ?? 3;
}

function sexoFromDb(value: unknown) {
  return ({ 1: "M", 2: "F", 3: "O" } as Record<number, string>)[Number(value)] ?? "O";
}

router.get(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    if (!ensureSelf(req, res)) return;
    const [rows] = await getDB().query(
      `SELECT idusuario AS id, DNI AS dni, nombre, apellido, email, telefono,
              fecha_nacimiento, municipio_idmunicipio, sexo, foto_perfil, activo
       FROM usuarios WHERE idusuario = ? LIMIT 1`,
      [req.user!.uid]
    );
    const user = (rows as Record<string, unknown>[])[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    user.sexo = sexoFromDb(user.sexo);
    res.json({ user });
  })
);

router.put(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    if (!ensureSelf(req, res)) return;
    const { dni, nombre, apellido, telefono, fecha_nacimiento, municipio_idmunicipio, sexo } = req.body ?? {};
    const sets: string[] = [];
    const params: unknown[] = [];
    const push = (column: string, value: unknown) => {
      sets.push(`${column} = ?`);
      params.push(value);
    };

    if (dni != null) {
      const dniNorm = String(dni).replace(/\D+/g, "");
      if (!/^\d{7,8}$/.test(dniNorm)) return res.status(400).json({ error: "DNI inválido" });
      const [duplicates] = await getDB().query(
        `SELECT idusuario FROM usuarios WHERE DNI = ? AND idusuario <> ? LIMIT 1`,
        [dniNorm, req.user!.uid]
      );
      if ((duplicates as unknown[]).length > 0) return res.status(409).json({ error: "DNI ya registrado" });
      push("DNI", dniNorm);
    }
    if (nombre != null) push("nombre", String(nombre).trim());
    if (apellido != null) push("apellido", String(apellido).trim());
    if (telefono != null) push("telefono", String(telefono));
    if (fecha_nacimiento != null) {
      const date = String(fecha_nacimiento);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Fecha inválida" });
      push("fecha_nacimiento", date);
    }
    if (municipio_idmunicipio != null) {
      const municipalityId = Number(municipio_idmunicipio);
      const [municipalities] = await getDB().query(`SELECT idmunicipio FROM municipio WHERE idmunicipio = ?`, [municipalityId]);
      if ((municipalities as unknown[]).length === 0) return res.status(400).json({ error: "Municipio inválido" });
      push("municipio_idmunicipio", municipalityId);
    }
    if (sexo != null) push("sexo", sexoToDb(sexo));
    if (sets.length === 0) return res.status(400).json({ error: "Nada para actualizar" });

    params.push(req.user!.uid);
    await getDB().execute(`UPDATE usuarios SET ${sets.join(", ")} WHERE idusuario = ?`, params);

    const [rows] = await getDB().query(
      `SELECT idusuario AS id, DNI AS dni, nombre, apellido, email, telefono,
              fecha_nacimiento, municipio_idmunicipio, sexo, foto_perfil, activo
       FROM usuarios WHERE idusuario = ? LIMIT 1`,
      [req.user!.uid]
    );
    const user = (rows as Record<string, unknown>[])[0];
    user.sexo = sexoFromDb(user.sexo);
    res.json({ user });
  })
);

export default router;
