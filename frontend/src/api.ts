import axios from 'axios';
import type { Job, CreateJobData } from './types';

const API_URL = 'http://localhost:3000/jobs';

export const fetchJobs = async (): Promise<Job[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createJob = async (data: CreateJobData): Promise<Job> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateJobStatus = async (id: string, status: string): Promise<Job> => {
  const response = await axios.patch(`${API_URL}/${id}/status`, { status });
  return response.data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
