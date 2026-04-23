export interface Note {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
