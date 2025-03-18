import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserListResponse,
} from "../models/User";
import userRepository from "../repositories/UserRepository";

class UserService {
  public async getAllUsers(page = 1, limit = 10): Promise<UserListResponse> {
    return userRepository.findAll(page, limit);
  }

  public async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }

  public async createUser(userData: CreateUserDTO): Promise<User> {
    return userRepository.create(userData);
  }

  public async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    return userRepository.update(id, userData);
  }

  public async deleteUser(id: string): Promise<void> {
    await userRepository.delete(id);
  }
}

export default new UserService();
