// This file is now deprecated and will be removed in a future update.
// All document data is now fetched directly from Firestore.
export type Document = {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  thumbnailId: string;
};

export const documents: Document[] = [];
