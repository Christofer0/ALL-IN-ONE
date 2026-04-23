import { FolderRepository } from "../repositories/FolderRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";

export const FolderService = {
  async getAll() {
    return FolderRepository.findAll();
  },

  async create(data: { name: string; icon?: string }) {
    const newItem = await FolderRepository.create(data);

    await LogRepository.create({
      action: "CREATE_FOLDER",
      entityType: "FOLDER",
      entityId: newItem.id,
      details: { name: newItem.name },
    });

    return newItem;
  },

  async update(id: string, data: { name?: string; icon?: string }) {
    const updatedItem = await FolderRepository.update(id, data);
    if (!updatedItem) throw new Error("Folder not found");

    await LogRepository.create({
      action: "UPDATE_FOLDER",
      entityType: "FOLDER",
      entityId: updatedItem.id,
      details: { name: updatedItem.name },
    });

    return updatedItem;
  },

  async delete(id: string) {
    const deletedItem = await FolderRepository.delete(id);
    if (!deletedItem) return false;

    await LogRepository.create({
      action: "DELETE_FOLDER",
      entityType: "FOLDER",
      entityId: deletedItem.id,
      details: { name: deletedItem.name },
    });

    return true;
  },
};
