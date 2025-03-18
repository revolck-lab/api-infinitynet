import { Request, Response } from "express";
import roleService from "../services/RoleService";
import { CreateRoleDTO, UpdateRoleDTO } from "../models/Role";
import { AppError } from "../../../shared/errors/AppError";

class RoleController {
  public async getAllRoles(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await roleService.getAllRoles(page, limit);

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

  public async getRoleById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);

      return res.status(200).json({
        status: "success",
        data: role,
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

  public async createRole(req: Request, res: Response): Promise<Response> {
    try {
      const roleData: CreateRoleDTO = req.body;

      if (!roleData.name) {
        return res.status(400).json({
          status: "error",
          message: "O nome do perfil é obrigatório",
        });
      }

      const newRole = await roleService.createRole(roleData);

      return res.status(201).json({
        status: "success",
        data: newRole,
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

  public async updateRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const roleData: UpdateRoleDTO = req.body;

      if (Object.keys(roleData).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Nenhum dado fornecido para atualização",
        });
      }

      const updatedRole = await roleService.updateRole(id, roleData);

      return res.status(200).json({
        status: "success",
        data: updatedRole,
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

  public async deleteRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      await roleService.deleteRole(id);

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

export default new RoleController();
