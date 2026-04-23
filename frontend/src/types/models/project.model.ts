export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content?: string;
  techStack: string[];
  coverImage: string;
  demoUrl?: string;
  githubUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  overview?: string;
  problem?: string;
  solution?: string;
  results?: string;
  duration?: string;
  impact?: string;
  teamSize?: string;
  createdAt: string;
  updatedAt?: string;
  cover_image?: string; // Fallback for snake_case from DB
}
