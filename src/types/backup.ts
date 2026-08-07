export type BackupProgressEvent = {
  type: "progress" | "complete" | "error";
  stage?: "prepare" | "database" | "uploads" | "zip" | "done";
  message: string;
  percent?: number;
  current?: number;
  total?: number;
  file?: string;
  jobId?: string;
  filename?: string;
  downloadPath?: string;
  sizeBytes?: number;
};
