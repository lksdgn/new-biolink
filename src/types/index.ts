// Tipos compartilhados da aplicação

export interface User {
  id: string;
  email: string;
  username: string;
  slug: string;
  isPremium: boolean;
}

export interface Page {
  id: string;
  userId: string;
  theme: Theme;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  fontFamily?: string;
  backgroundImage?: string;
  customCss?: string;
  [key: string]: any;
}

export interface Block {
  id: string;
  pageId: string;
  type: BlockType;
  position: number;
  data: BlockData;
}

export type BlockType = 'text' | 'link' | 'image' | 'spotify' | 'discord' | 'divider';

export interface BlockData {
  [key: string]: any;
}

export interface TextBlockData extends BlockData {
  content: string;
  fontSize?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
}

export interface LinkBlockData extends BlockData {
  title: string;
  url: string;
  icon?: string | null;
}

export interface ImageBlockData extends BlockData {
  url: string;
  alt?: string;
  width?: string;
}

export interface SpotifyBlockData extends BlockData {
  playlistId: string | null;
  playlistName: string;
  playlistImage?: string;
}

export interface DiscordBlockData extends BlockData {
  username: string;
  discriminator: string;
  avatar?: string;
  userId: string;
}

export interface DividerBlockData extends BlockData {
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface LeaderboardEntry {
  position: number;
  slug: string;
  views: number;
}

export interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: Date | null;
  daysRemaining: number;
}

export interface OAuthStatus {
  isConnected: boolean;
  [key: string]: any;
}
