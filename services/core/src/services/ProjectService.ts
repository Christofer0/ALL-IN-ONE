import { ProjectRepository } from "../repositories/ProjectRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";
import cloudinary from "../utils/cloudinary.js";

const VALID_PROJECT_FIELDS = [
  "title",
  "slug",
  "category",
  "description",
  "content",
  "coverImage",
  "demoUrl",
  "githubUrl",
  "techStack",
  "isPublished",
  "isFeatured",
  "overview",
  "problem",
  "solution",
  "results",
  "duration",
  "impact",
  "teamSize",
];

const sanitizeData = (data: any) => {
  const sanitized: any = {};
  for (const key of VALID_PROJECT_FIELDS) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

const extractPublicId = (url: string) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  
  // parts[uploadIndex + 1] is 'v12345678'
  // parts[uploadIndex + 2] and beyond is the path with extension
  const pathParts = parts.slice(uploadIndex + 2);
  const pathWithExt = pathParts.join("/");
  // remove extension
  return pathWithExt.split(".")[0];
};

export const ProjectService = {
  async getAll() {
    return ProjectRepository.findAll();
  },

  async getAllPublished() {
    return ProjectRepository.findAllPublished();
  },

  async getBySlug(slug: string, onlyPublished = false) {
    return ProjectRepository.findBySlug(slug, onlyPublished);
  },

  async create(rawData: any) {
    const data = sanitizeData(rawData);
    // Intercept and upload image to Cloudinary if it's base64
    if (data.coverImage && data.coverImage.startsWith("data:image/")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(data.coverImage, {
          folder: "portfolio_projects",
        });
        data.coverImage = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }

    const newItem = await ProjectRepository.create(data);

    await LogRepository.create({
      action: "CREATE_PROJECT",
      entityType: "PROJECT",
      entityId: newItem.id,
      details: { title: newItem.title },
    });

    return newItem;
  },

  async update(id: string, rawData: any) {
    const data = sanitizeData(rawData);

    // If updating with a new image, delete the old one from Cloudinary first
    if (data.coverImage && data.coverImage.startsWith("data:image/")) {
      const oldProject = await ProjectRepository.findById(id);
      if (oldProject?.coverImage) {
        const publicId = extractPublicId(oldProject.coverImage);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Failed to delete old image from Cloudinary:", err);
          }
        }
      }

      try {
        const uploadResponse = await cloudinary.uploader.upload(data.coverImage, {
          folder: "portfolio_projects",
        });
        data.coverImage = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }

    const updatedItem = await ProjectRepository.update(id, data);
    if (!updatedItem) throw new Error("Project not found");

    await LogRepository.create({
      action: "UPDATE_PROJECT",
      entityType: "PROJECT",
      entityId: updatedItem.id,
      details: { title: updatedItem.title },
    });

    return updatedItem;
  },

  async delete(id: string) {
    // Fetch project to get the image URL before deletion
    const project = await ProjectRepository.findById(id);
    if (project?.coverImage) {
      const publicId = extractPublicId(project.coverImage);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete image from Cloudinary on project deletion:", err);
          // We continue to delete from DB even if Cloudinary fails
        }
      }
    }

    const deletedItem = await ProjectRepository.delete(id);
    if (!deletedItem) return false;

    await LogRepository.create({
      action: "DELETE_PROJECT",
      entityType: "PROJECT",
      entityId: deletedItem.id,
      details: { title: deletedItem.title },
    });

    return true;
  },
};
