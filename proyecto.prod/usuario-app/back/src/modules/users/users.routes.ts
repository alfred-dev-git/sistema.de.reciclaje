// src/modules/users/users.routes.ts
import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { getDB } from "@/config/db";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    console.log("ID recibido back:", id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

    const db = getDB();
    const [rows] = await db.query(
      `SELECT idusuario AS id, nombre, apellido, email, telefono, puntos
       FROM usuario WHERE idusuario = ?`,
      [id]
    );
    const u = (rows as any[])[0];
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user: u });
  })
);


router.get(
  "/users/:id/photo",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send("id inválido");

    const db = getDB();
    const [rows] = await db.query(
      `SELECT foto_perfil FROM usuario WHERE idusuario = ?`,
      [id]
    );
    const u = (rows as any[])[0];
    if (!u) return res.status(404).send("Usuario no encontrado");

    const buf: Buffer | null = u.foto_perfil;
    if (!buf) return res.status(204).send(); // sin contenido

    // Si no guardás el mimetype, servimos como JPEG por defecto
    res.setHeader("Content-Type", "image/jpeg");
    res.send(buf);
  })
);


router.post(
  "/users/:id/photo",
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "Falta archivo 'image'" });

    const db = getDB();

    const [rows] = await db.query(
      `SELECT idusuario FROM usuario WHERE idusuario = ?`,
      [id]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await db.execute(
      `UPDATE usuario SET foto_perfil = ? WHERE idusuario = ?`,
      [file.buffer, id]
    );

    res.status(204).send(); 
  })
);

// PUT /api/users/:id  -> Actualiza datos del usuario (solo los que envíes)
router.put(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    // Campos permitidos
    const {
      dni,
      nombre,
      apellido,
      telefono,
      fecha_nacimiento,
      municipio_idmunicipio,
      sexo,
      // Opcional: actualizar foto como base64 (data URL o base64 puro)
      foto_perfil_base64,
    } = req.body ?? {};

    const db = getDB();

    // Validación de DNI único (si viene)
    if (dni != null) {
      const dniStr = String(dni).replace(/\D+/g, "");
      if (!dniStr) return res.status(400).json({ error: "dni inválido" });

      const [dup] = await db.query(
        `SELECT 1 FROM usuario WHERE dni = ? AND idusuario <> ? LIMIT 1`,
        [dniStr, id]
      );
      if ((dup as any[]).length > 0) {
        return res.status(409).json({ error: "DNI ya registrado" });
      }
    }

    const sets: string[] = [];
    const params: any[] = [];

    const push = (col: string, val: any) => {
      sets.push(`${col} = ?`);
      params.push(val);
    };

    if (dni != null) {
      const dniStr = String(dni).replace(/\D+/g, "");
      push("dni", dniStr);
    }
    if (nombre != null) push("nombre", String(nombre));
    if (apellido != null) push("apellido", String(apellido));
    if (telefono != null) push("telefono", String(telefono));
    if (fecha_nacimiento != null) {
      const fnac = String(fecha_nacimiento);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fnac)) {
        return res
          .status(400)
          .json({ error: "fecha_nacimiento inválida (formato YYYY-MM-DD)" });
      }
      push("fecha_nacimiento", fnac);
    }
    if (municipio_idmunicipio != null) {
      const muni = Number(municipio_idmunicipio);
      if (!Number.isFinite(muni)) {
        return res.status(400).json({ error: "municipio_idmunicipio inválido" });
      }
      push("municipio_idmunicipio", muni);
    }
    if (sexo != null) {
      const sx = String(sexo);
      if (!["M", "F", "O"].includes(sx)) {
        return res.status(400).json({ error: "sexo inválido (M|F|O)" });
      }
      push("sexo", sx);
    }

    // Foto por base64 (opcional). Si preferís, seguí usando tu endpoint /users/:id/photo
    if (foto_perfil_base64 != null) {
      try {
        let b64 = String(foto_perfil_base64);
        const m = b64.match(/^data:.*?;base64,(.*)$/);
        if (m) b64 = m[1];
        const buf = Buffer.from(b64, "base64");
        push("foto_perfil", buf);
      } catch {
        return res.status(400).json({ error: "foto_perfil_base64 inválido" });
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: "Nada para actualizar" });
    }

    params.push(id);
    await db.execute(`UPDATE usuario SET ${sets.join(", ")} WHERE idusuario = ?`, params);

    // Devolvemos el usuario actualizado (sin password/foto en base64)
    const [rows] = await db.query(
      `SELECT
         idusuario AS id,
         dni, nombre, apellido, email, telefono,
         fecha_nacimiento, municipio_idmunicipio, puntos, sexo
       FROM usuario
       WHERE idusuario = ?
       LIMIT 1`,
      [id]
    );

    const user = (rows as any[])[0] ?? null;
    res.json({ user });
  })
);


export default router;
