import { NoteRepository } from "../repositories/NoteRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";

export const NoteService = {
  async getAll(folderId?: string, search?: string) {
    return NoteRepository.findAll(folderId, search);
  },

  async getById(id: string) {
    const note = await NoteRepository.findById(id);
    if (!note) throw new Error("Note not found");
    return note;
  },

  async create(data: { folderId?: string; title: string; content?: string; tags?: string[]; isPinned?: boolean }) {
    const newItem = await NoteRepository.create(data);

    await LogRepository.create({
      action: "CREATE_NOTE",
      entityType: "NOTE",
      entityId: newItem.id,
      details: { title: newItem.title },
    });

    return newItem;
  },

  async update(id: string, data: { folderId?: string; title?: string; content?: string; tags?: string[]; isPinned?: boolean }) {
    const updatedItem = await NoteRepository.update(id, data);
    if (!updatedItem) throw new Error("Note not found");

    await LogRepository.create({
      action: "UPDATE_NOTE",
      entityType: "NOTE",
      entityId: updatedItem.id,
      details: { title: updatedItem.title },
    });

    return updatedItem;
  },

  async delete(id: string) {
    const deletedItem = await NoteRepository.delete(id);
    if (!deletedItem) return false;

    await LogRepository.create({
      action: "DELETE_NOTE",
      entityType: "NOTE",
      entityId: deletedItem.id,
      details: { title: deletedItem.title },
    });

    return true;
  },
};
