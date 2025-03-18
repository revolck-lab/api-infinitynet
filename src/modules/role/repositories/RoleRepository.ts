import { prisma } from "../../../shared/database/prisma";
import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleListResponse,
} from "../models/Role";
import { AppError } from "../../../shared/errors/AppError";

class RoleRepository {
  public async findAll(page = 1, limit = 10): Promise<RoleListResponse> {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        orderBy: {
          level: "asc",
        },
      }),
      prisma.role.count(),
    ]);

    return {
      roles: roles as Role[],
      total,
      page,
      limit,
    };
  }

  public async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    return role as Role | null;
  }

  public async findByName(name: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { name },
    });

    return role as Role | null;
  }

  public async create(data: CreateRoleDTO): Promise<Role> {
    // Verifica se já existe role com esse nome
    const existingRole = await this.findByName(data.name);
    if (existingRole) {
      throw new AppError("Já existe um perfil com este nome", 400);
    }

    const role = await prisma.role.create({
      data,
    });

    return role as Role;
  }

  public async update(id: string, data: UpdateRoleDTO): Promise<Role> {
    const role = await this.findById(id);

    if (!role) {
      throw new AppError("Perfil não encontrado", 404);
    }

    // Se estiver atualizando o nome, verifica se já existe
    if (data.name && data.name !== role.name) {
      const existingRole = await this.findByName(data.name);
      if (existingRole) {
        throw new AppError("Já existe um perfil com este nome", 400);
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data,
    });

    return updatedRole as Role;
  }

  public async delete(id: string): Promise<void> {
    const role = await this.findById(id);

    if (!role) {
      throw new AppError("Perfil não encontrado", 404);
    }

    // Verifica se há usuários usando este perfil
    const userCount = await prisma.user.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new AppError(
        "Este perfil está sendo utilizado por usuários e não pode ser excluído",
        400
      );
    }

    await prisma.role.delete({
      where: { id },
    });
  }
}

export default new RoleRepository();
