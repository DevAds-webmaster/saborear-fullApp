import { Request, Response } from "express";
import Macros from "../models/macros.js";

class macrosController {
  async getMacrosOptionStyles(req: Request, res: Response) {
    try {
      const macros = await Macros.findOne({ key: "style-options" });
      if (!macros) {
        return res.status(404).json({ error: "No se encontraron macros" });
      }
      res.json(macros?.data);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener macros" });
    }
  }

  async updateMacrosOptionStyles(req: Request, res: Response) {
    try {
      const { key, data } = req.body;
      const macros = await Macros.findOneAndUpdate({ key }, { data }, { new: true });
      res.json(macros);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar macros" });
    }
  }
}

export default new macrosController();


