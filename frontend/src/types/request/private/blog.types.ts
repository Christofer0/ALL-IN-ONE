import type { Blog } from "../../models/blog.model";

export type CreateBlogRequest = Omit<Blog, "id" | "createdAt" | "updatedAt">;
export type UpdateBlogRequest = Partial<CreateBlogRequest>;
