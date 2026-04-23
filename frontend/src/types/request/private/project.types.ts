import type { Project } from "../../models/project.model";

export type CreateProjectRequest = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type UpdateProjectRequest = Partial<CreateProjectRequest>;
