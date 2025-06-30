import api from './api.js';

// Get all jobs/projects
export async function getAllJobsProjects() {
  const response = await api.get('/jobs-projects');
  return response.data;
}