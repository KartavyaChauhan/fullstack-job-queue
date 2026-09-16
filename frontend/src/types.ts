export interface Job {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  type: string;
}
