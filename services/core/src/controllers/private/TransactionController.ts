import { Request, Response } from "express";
import { TransactionService } from "../../services/TransactionService.js";

export const TransactionController = {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await TransactionService.getAll();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createTransaction(req: Request, res: Response) {
    try {
      const transaction = await TransactionService.create(req.body);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateTransaction(req: Request, res: Response) {
    try {
      const transaction = await TransactionService.update(req.params.id as string, req.body);
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteTransaction(req: Request, res: Response) {
    try {
      const success = await TransactionService.delete(req.params.id as string);
      if (!success) return res.status(404).json({ error: "Transaction not found" });
      res.json({ message: "Transaction deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
