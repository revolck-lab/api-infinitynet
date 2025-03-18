import { prisma } from "../../../shared/database/prisma";
import {
  Status,
  CreateStatusDTO,
  UpdateStatusDTO,
  StatusListResponse,
} from "../models/Status";
import { AppError, ErrorType } from "../../../shared/errors/AppError";

class StatusRepository {
  public async findAll(page = 1, limit = 10): Promise<StatusListResponse> {
    const skip = (page - 1) * limit;

    const [statuses, total] = await Promise.all([
      prisma.status.findMany({
        skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.status.count(),
    ]);

    return {
      statuses: statuses as Status[],
      total,
      page,
      limit,
    };
  }

  public async findById(id: string): Promise<Status | null> {
    const status = await prisma.status.findUnique({
      where: { id },
    });

    return status as Status | null;
  }

  public async findByName(name: string): Promise<Status | null> {
    const status = await prisma.status.findUnique({
      where: { name },
    });

    return status as Status | null;
  }

  public async create(data: CreateStatusDTO): Promise<Status> {
    // Verifica se já existe status com esse nome
    const existingStatus = await this.findByName(data.name);
    if (existingStatus) {
      throw new AppError("Já existe um status com este nome", ErrorType.CONFLICT, 400);
    }

    const status = await prisma.status.create({
      data,
    });

    return status as Status;
  }

  public async update(id: string, data: UpdateStatusDTO): Promise<Status> {
    const status = await this.findById(id);

    if (!status) {
      throw new AppError("Status não encontrado", ErrorType.NOT_FOUND, 404);
    }

    // Se estiver atualizando o nome, verifica se já existe
    if (data.name && data.name !== status.name) {
      const existingStatus = await this.findByName(data.name);
      if (existingStatus) {
        throw new AppError("Já existe um status com este nome", ErrorType.CONFLICT, 400);
      }
    }

    const updatedStatus = await prisma.status.update({
      where: { id },
      data,
    });

    return updatedStatus as Status;
  }

  public async delete(id: string): Promise<void> {
    const status = await this.findById(id);

    if (!status) {
      throw new AppError("Status não encontrado", ErrorType.NOT_FOUND, 404);
    }

    // Verifica se há usuários usando este status
    const userCount = await prisma.user.count({
      where: { statusId: id },
    });

    if (userCount > 0) {
      throw new AppError(
        "Este status está sendo utilizado por usuários e não pode ser excluído",
        ErrorType.CONFLICT,
        400
      );
    }

    await prisma.status.delete({
      where: { id },
    });
  }
}

export default new StatusRepository();