import { BlogRepository } from "../repositories/BlogRepository.js";
import { LogRepository } from "../repositories/LogRepository.js";
import cloudinary from "../utils/cloudinary.js";

const VALID_BLOG_FIELDS = [
  "title",
  "slug",
  "category",
  "excerpt",
  "content",
  "coverImage",
  "isPublished",
];

const sanitizeData = (data: any) => {
  const sanitized: any = {};
  for (const key of VALID_BLOG_FIELDS) {
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
  
  const pathParts = parts.slice(uploadIndex + 2);
  const pathWithExt = pathParts.join("/");
  return pathWithExt.split(".")[0];
};

export const BlogService = {
  async getAll() {
    return BlogRepository.findAll();
  },

  async getAllPublished() {
    return BlogRepository.findAllPublished();
  },

  async getBySlug(slug: string, onlyPublished = false) {
    return BlogRepository.findBySlug(slug, onlyPublished);
  },

  async create(rawData: any) {
    const data = sanitizeData(rawData);
    
    // Intercept and upload image to Cloudinary if it's base64
    if (data.coverImage && data.coverImage.startsWith("data:image/")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(data.coverImage, {
          folder: "portfolio_blogs",
        });
        data.coverImage = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }

    const newItem = await BlogRepository.create(data);

    await LogRepository.create({
      action: "CREATE_BLOG",
      entityType: "BLOG",
      entityId: newItem.id,
      details: { title: newItem.title },
    });

    return newItem;
  },

  async update(id: string, rawData: any) {
    const data = sanitizeData(rawData);

    // If updating with a new image, delete the old one from Cloudinary first
    if (data.coverImage && data.coverImage.startsWith("data:image/")) {
      const oldBlog = await BlogRepository.findById(id);
      if (oldBlog?.coverImage) {
        const publicId = extractPublicId(oldBlog.coverImage);
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
          folder: "portfolio_blogs",
        });
        data.coverImage = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }

    const updatedItem = await BlogRepository.update(id, data);
    if (!updatedItem) throw new Error("Article not found");

    await LogRepository.create({
      action: "UPDATE_BLOG",
      entityType: "BLOG",
      entityId: updatedItem.id,
      details: { title: updatedItem.title },
    });

    return updatedItem;
  },

  async delete(id: string) {
    // Fetch blog to get the image URL before deletion
    const blog = await BlogRepository.findById(id);
    if (blog?.coverImage) {
      const publicId = extractPublicId(blog.coverImage);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete image from Cloudinary on blog deletion:", err);
        }
      }
    }

    const deletedItem = await BlogRepository.delete(id);
    if (!deletedItem) return false;

    await LogRepository.create({
      action: "DELETE_BLOG",
      entityType: "BLOG",
      entityId: deletedItem.id,
      details: { title: deletedItem.title },
    });

    return true;
  },
};
