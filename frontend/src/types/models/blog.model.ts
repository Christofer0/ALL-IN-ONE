export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryLabel?: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  cover_image?: string; // Fallback for snake_case from DB
  isPublished: boolean;
  isFeatured?: boolean;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
}
