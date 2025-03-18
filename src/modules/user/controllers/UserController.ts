import { Request, Response } from 'express';
import userService from '../services/UserService';
import { CreateUserDTO, UpdateUserDTO } from '../models/User';
import { AppError } from '../../../shared/errors/AppError';

class UserController {
  public async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await userService.getAllUsers(page, limit);

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  public async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const userData: CreateUserDTO = req.body;
      
      const newUser = await userService.createUser(userData);

      return res.status(201).json({
        status: 'success',
        data: newUser,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  public async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO = req.body;

      if (Object.keys(userData).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum dado fornecido para atualização',
        });
      }

      const updatedUser = await userService.updateUser(id, userData);

      return res.status(200).json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }
}

export default new UserController();