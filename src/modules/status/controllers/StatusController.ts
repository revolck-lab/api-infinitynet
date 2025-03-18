import { Request, Response } from "express";
import statusService from "../services/StatusService";
import { CreateStatusDTO, UpdateStatusDTO } from "../models/Status";
import { AppError } from "../../../shared/errors/AppError";

class StatusController {
  public async getAllStatuses(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await statusService.getAllStatuses(page, limit);

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
      });
    }
  }

  public async getStatusById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const status = await statusService.getStatusById(id);

      return res.status(200).json({
        status: "success",
        data: status,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
      });
    }
  }

  public async createStatus(req: Request, res: Response): Promise<Response> {
    try {
      const statusData: CreateStatusDTO = req.body;

      if (!statusData.name) {
        return res.status(400).json({
          status: "error",
          message: "O nome do status é obrigatório",
        });
      }

      const newStatus = await statusService.createStatus(statusData);

      return res.status(201).json({
        status: "success",
        data: newStatus,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
      });
    }
  }

  public async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const statusData: UpdateStatusDTO = req.body;

      if (Object.keys(statusData).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Nenhum dado fornecido para atualização",
        });
      }

      const updatedStatus = await statusService.updateStatus(id, statusData);

      return res.status(200).json({
        status: "success",
        data: updatedStatus,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
      });
    }
  }

  public async deleteStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      await statusService.deleteStatus(id);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
      });
    }
  }
}

export default new StatusController();
