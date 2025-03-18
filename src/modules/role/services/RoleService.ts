import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleListResponse,
} from "../models/Role";
import roleRepository from "../repositories/RoleRepository";

class RoleService {
  public async getAllRoles(page = 1, limit = 10): Promise<RoleListResponse> {
    return roleRepository.findAll(page, limit);
  }

  public async getRoleById(id: string): Promise<Role> {
    const role = await roleRepository.findById(id);

    if (!role) {
      throw new Error("Perfil não encontrado");
    }

    return role;
  }

  public async createRole(roleData: CreateRoleDTO): Promise<Role> {
    return roleRepository.create(roleData);
  }

  public async updateRole(id: string, roleData: UpdateRoleDTO): Promise<Role> {
    return roleRepository.update(id, roleData);
  }

  public async deleteRole(id: string): Promise<void> {
    await roleRepository.delete(id);
  }
}

export default new RoleService();
