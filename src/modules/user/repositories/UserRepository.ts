import { prisma } from "../../../shared/database/prisma";
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserListResponse,
} from "../models/User";
import { AppError, ErrorType } from "../../../shared/errors/AppError";
import { hash } from "bcrypt";

class UserRepository {
  public async findAll(page = 1, limit = 10): Promise<UserListResponse> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users as User[],
      total,
      page,
      limit,
    };
  }

  public async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        status: true,
      },
    });

    return user as User | null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        status: true,
      },
    });

    return user as User | null;
  }

  public async findByCpf(cpf: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    return user as User | null;
  }

  public async create(data: CreateUserDTO): Promise<User> {
    // Verifica se já existe usuário com esse e-mail
    const existingUserEmail = await this.findByEmail(data.email);
    if (existingUserEmail) {
      throw new AppError("Este e-mail já está em uso", ErrorType.CONFLICT, 400);
    }

    // Verifica se já existe usuário com esse CPF
    const existingUserCpf = await this.findByCpf(data.cpf);
    if (existingUserCpf) {
      throw new AppError("Este CPF já está cadastrado", ErrorType.CONFLICT, 400);
    }

    // Verifica se os IDs de role e status existem
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new AppError("Perfil (role) não encontrado", ErrorType.BAD_REQUEST, 400);
    }

    const status = await prisma.status.findUnique({
      where: { id: data.statusId },
    });

    if (!status) {
      throw new AppError("Status não encontrado", ErrorType.BAD_REQUEST, 400);
    }

    // Criptografa a senha
    const hashedPassword = await hash(data.senha, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        senha: hashedPassword,
      },
      include: {
        role: true,
        status: true,
      },
    });

    return user as User;
  }

  public async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", ErrorType.NOT_FOUND, 404);
    }

    // Se estiver atualizando o e-mail, verifica se já existe
    if (data.email && data.email !== user.email) {
      const existingUserEmail = await this.findByEmail(data.email);
      if (existingUserEmail) {
        throw new AppError("Este e-mail já está em uso", ErrorType.CONFLICT, 400);
      }
    }

    // Se estiver atualizando o CPF, verifica se já existe
    if (data.cpf && data.cpf !== user.cpf) {
      const existingUserCpf = await this.findByCpf(data.cpf);
      if (existingUserCpf) {
        throw new AppError("Este CPF já está cadastrado", ErrorType.CONFLICT, 400);
      }
    }

    // Se estiver atualizando a roleId, verifica se existe
    if (data.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new AppError("Perfil (role) não encontrado", ErrorType.BAD_REQUEST, 400);
      }
    }

    // Se estiver atualizando o statusId, verifica se existe
    if (data.statusId) {
      const status = await prisma.status.findUnique({
        where: { id: data.statusId },
      });

      if (!status) {
        throw new AppError("Status não encontrado", ErrorType.BAD_REQUEST, 400);
      }
    }

    // Se estiver atualizando a senha, criptografa
    let updateData = { ...data };

    if (data.senha) {
      const hashedPassword = await hash(data.senha, 10);
      updateData.senha = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        status: true,
      },
    });

    return updatedUser as User;
  }

  public async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", ErrorType.NOT_FOUND, 404);
    }

    await prisma.user.delete({
      where: { id },
    });
  }
}

export default new UserRepository();