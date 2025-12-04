import { Request, Response } from "express";
import Macros from "../models/Macros.js";

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

  async insertMacrosOptionStyles(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const macros = await Macros.findOneAndUpdate(
        { key: "style-options" },
        { key: "style-options", data },
        { new: true, upsert: true }
      );
      res.json(macros);
    } catch (error) {
      res.status(500).json({ error: "Error al insertar macros de style-options" });
    }
  }

  async deleteMacrosOptionStyles(req: Request, res: Response) {
    try {
      const deleted = await Macros.findOneAndDelete({ key: "style-options" });
      if (!deleted) {
        return res.status(404).json({ error: "No existía registro de style-options para eliminar" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar macros de style-options" });
    }
  }

  async getMacrosThemes(req: Request, res: Response) {
    try {
      const macros = await Macros.findOne({ key: "themes" });
      if (!macros) {
        return res.status(404).json({ error: "No se encontraron macros de themes" });
      }
      res.json(macros?.data);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener macros de themes" });
    }
  }

  async updateMacrosThemes(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const macros = await Macros.findOneAndUpdate({ key: "themes" }, { data }, { new: true });
      res.json(macros);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar macros de themes" });
    }
  }

  async insertMacrosThemes(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const macros = await Macros.findOneAndUpdate(
        { key: "themes" },
        { key: "themes", data },
        { new: true, upsert: true }
      );
      res.json(macros);
    } catch (error) {
      res.status(500).json({ error: "Error al insertar macros de themes" });
    }
  }

  async deleteMacrosThemes(req: Request, res: Response) {
    try {
      const deleted = await Macros.findOneAndDelete({ key: "themes" });
      if (!deleted) {
        return res.status(404).json({ error: "No existía registro de themes para eliminar" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar macros de themes" });
    }
  }
}

export default new macrosController();


