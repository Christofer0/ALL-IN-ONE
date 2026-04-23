import { TransactionRepository } from "../repositories/TransactionRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";

const VALID_TRANSACTION_FIELDS = [
  "date",
  "description",
  "category",
  "type",
  "amount",
  "notes",
];

const sanitizeData = (data: any) => {
  const sanitized: any = {};
  for (const key of VALID_TRANSACTION_FIELDS) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

export const TransactionService = {
  async getAll() {
    return TransactionRepository.findAll();
  },

  async create(rawData: any) {
    const data = sanitizeData(rawData);
    const newItem = await TransactionRepository.create(data);

    await LogRepository.create({
      action: "CREATE_TRANSACTION",
      entityType: "TRANSACTION",
      entityId: newItem.id,
      details: { description: newItem.description, amount: newItem.amount, type: newItem.type },
    });

    return newItem;
  },

  async update(id: string, rawData: any) {
    const data = sanitizeData(rawData);
    const updatedItem = await TransactionRepository.update(id, data);
    if (!updatedItem) throw new Error("Transaction not found");

    await LogRepository.create({
      action: "UPDATE_TRANSACTION",
      entityType: "TRANSACTION",
      entityId: updatedItem.id,
      details: { description: updatedItem.description, amount: updatedItem.amount, type: updatedItem.type },
    });

    return updatedItem;
  },

  async delete(id: string) {
    const deletedItem = await TransactionRepository.delete(id);
    if (!deletedItem) return false;

    await LogRepository.create({
      action: "DELETE_TRANSACTION",
      entityType: "TRANSACTION",
      entityId: deletedItem.id,
      details: { description: deletedItem.description, amount: deletedItem.amount, type: deletedItem.type },
    });

    return true;
  },
};
