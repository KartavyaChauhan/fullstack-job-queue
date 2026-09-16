import { useEffect, useState } from 'react';
import type { Job } from './types';
import { fetchJobs, createJob, updateJobStatus, deleteJob } from './api';
import './App.css';
import { Trash2, Play, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [filter, setFilter] = useState('all');

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    try {
      setError(null);
      await createJob({ title, type });
      setTitle('');
      await loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create job');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setError(null);
      await updateJobStatus(id, status);
      await loadJobs();
    } catch (err: any) {
      // 409 Conflict will be caught here if someone else transitioned it
      setError(err.response?.data?.message || err.message || 'Failed to update job status');
      await loadJobs(); // reload to get the latest state
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      setError(null);
      await deleteJob(id);
      await loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete job');
    }
  };

  const counts = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="container">
      <header>
        <h1>Job Queue Dashboard</h1>
        <div className="stats">
          <div className="stat-box">Total: {counts.total}</div>
          <div className="stat-box pending">Pending: {counts.pending}</div>
          <div className="stat-box running">Running: {counts.running}</div>
          <div className="stat-box completed">Completed: {counts.completed}</div>
          <div className="stat-box failed">Failed: {counts.failed}</div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        <section className="create-section">
          <h2>Create Job</h2>
          <form onSubmit={handleCreateJob}>
            <input 
              type="text" 
              placeholder="Job Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="task">Task</option>
              <option value="email">Email</option>
              <option value="report">Report</option>
            </select>
            <button type="submit" disabled={!title}>Create</button>
          </form>
        </section>

        <section className="jobs-section">
          <div className="jobs-header">
            <h2>Jobs</h2>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <button className="refresh-btn" onClick={loadJobs} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading && jobs.length === 0 ? (
            <div className="loading">Loading jobs...</div>
          ) : (
            <div className="job-list">
              {filteredJobs.length === 0 ? (
                <div className="empty-state">No jobs found.</div>
              ) : (
                filteredJobs.map(job => (
                  <div key={job.id} className={`job-card ${job.status}`}>
                    <div className="job-info">
                      <h3>{job.title}</h3>
                      <span className="badge">{job.type}</span>
                      <span className={`status-indicator ${job.status}`}>{job.status}</span>
                      <span className="date">{new Date(job.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="job-actions">
                      {job.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(job.id, 'running')} title="Start Job">
                          <Play size={18} />
                        </button>
                      )}
                      {job.status === 'running' && (
                        <>
                          <button className="success-btn" onClick={() => handleUpdateStatus(job.id, 'completed')} title="Mark Completed">
                            <CheckCircle size={18} />
                          </button>
                          <button className="danger-btn" onClick={() => handleUpdateStatus(job.id, 'failed')} title="Mark Failed">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="delete-btn" onClick={() => handleDeleteJob(job.id)} title="Delete Job">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
