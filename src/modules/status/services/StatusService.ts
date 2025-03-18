import {
  Status,
  CreateStatusDTO,
  UpdateStatusDTO,
  StatusListResponse,
} from "../models/Status";
import statusRepository from "../repositories/StatusRepository";

class StatusService {
  public async getAllStatuses(
    page = 1,
    limit = 10
  ): Promise<StatusListResponse> {
    return statusRepository.findAll(page, limit);
  }

  public async getStatusById(id: string): Promise<Status> {
    const status = await statusRepository.findById(id);

    if (!status) {
      throw new Error("Status não encontrado");
    }

    return status;
  }

  public async createStatus(statusData: CreateStatusDTO): Promise<Status> {
    return statusRepository.create(statusData);
  }

  public async updateStatus(
    id: string,
    statusData: UpdateStatusDTO
  ): Promise<Status> {
    return statusRepository.update(id, statusData);
  }

  public async deleteStatus(id: string): Promise<void> {
    await statusRepository.delete(id);
  }
}

export default new StatusService();
