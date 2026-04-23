import { UserRepository } from "../repositories/UserRepository.js";
import cloudinary from "../utils/cloudinary.js";
import { comparePassword, hashPassword } from "../utils/auth.js";

const extractPublicId = (url: string) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  
  const pathParts = parts.slice(uploadIndex + 2);
  const pathWithExt = pathParts.join("/");
  return pathWithExt.split(".")[0];
};

export const UserService = {
  async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");
    
    // Don't return sensitive data
    const { passwordHash, ...profile } = user;
    return profile;
  },

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.shortBio !== undefined) updateData.shortBio = data.shortBio;
    
    // Handle Avatar Upload to Cloudinary
    if (data.avatarUrl && data.avatarUrl.startsWith("data:image/")) {
      const user = await UserRepository.findById(userId);
      
      // Delete old avatar if exists
      if (user?.avatarUrl) {
        const publicId = extractPublicId(user.avatarUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Failed to delete old avatar from Cloudinary:", err);
          }
        }
      }

      // Upload new avatar
      try {
        const uploadResponse = await cloudinary.uploader.upload(data.avatarUrl, {
          folder: "portfolio_avatars",
        });
        updateData.avatarUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    } else if (data.avatarUrl !== undefined) {
      // If it's not a base64 string, just update as is (e.g. if null or same URL)
      updateData.avatarUrl = data.avatarUrl;
    }

    const updatedUser = await UserRepository.update(userId, updateData);
    if (!updatedUser) throw new Error("User not found");

    const { passwordHash, ...profile } = updatedUser;
    return profile;
  },

  async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;
    
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await UserRepository.update(userId, { passwordHash: hashedNewPassword });

    return { message: "Password changed successfully" };
  },

  async getPublicProfile() {
    const user = await UserRepository.findFirstUser();
    if (!user) return null;
    
    const { passwordHash, ...profile } = user;
    return profile;
  },
};
