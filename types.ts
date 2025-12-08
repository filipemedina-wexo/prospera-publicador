export interface PublishResponse {
  success: boolean;
  url?: string;
  message: string;
}

export enum PublishStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PublishedLP {
  subdomain: string;
  url: string;
  createdAt: number;
}

export type ViewState = 'overview' | 'publish';