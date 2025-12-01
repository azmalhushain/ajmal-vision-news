export interface Article {
  id: number | string;
  title: string;
  date: string;
  summary: string;
  image: string;
  fullContent: string;
  category: string;
  videoUrl?: string | null;
  isPinned?: boolean;
  views?: number;
  likesCount?: number;
}
