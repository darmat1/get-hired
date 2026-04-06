export const GREENHOUSE_COMPANIES = [
  { name: 'Anthropic', boardToken: 'anthropic' },
  { name: 'PolyAI', boardToken: 'polyai' },
  { name: 'Parloa', boardToken: 'parloa' },
  { name: 'Intercom', boardToken: 'intercom' },
  { name: 'Hume AI', boardToken: 'humeai' },
  { name: 'Airtable', boardToken: 'airtable' },
  { name: 'Vercel', boardToken: 'vercel' },
  { name: 'Temporal', boardToken: 'temporal' },
  { name: 'Arize AI', boardToken: 'arizeai' },
  { name: 'RunPod', boardToken: 'runpod' },
  { name: 'Glean', boardToken: 'gleanwork' },
];

export interface GreenhouseJobResponse {
  id: number;
  internal_job_id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location: { name: string };
  metadata: any;
  departments: { id: number; name: string; child_ids: number[]; parent_id: number | null }[];
  content?: string; // HTML content, if requested with ?content=true
  questions?: GreenhouseQuestion[]; // If detailed job
}

export interface GreenhouseQuestion {
  name: string;
  label: string;
  required: boolean;
  fields: {
    name: string;
    type: string;
    options?: { label: string; value: string }[];
  }[];
}

export interface GreenhouseBoardResponse {
  jobs: GreenhouseJobResponse[];
  meta: { total: number };
}

const GREENHOUSE_API_BASE = 'https://boards-api.greenhouse.io/v1/boards';

/**
 * Fetches all jobs for a given Greenhouse board.
 */
export async function getJobs(boardToken: string): Promise<GreenhouseJobResponse[]> {
  const url = `${GREENHOUSE_API_BASE}/${boardToken}/jobs?content=true`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 } // Cache for 1 hour to avoid limits
  });

  if (!response.ok) {
    if (response.status === 404) return []; // Board might not exist or removed
    throw new Error(`Failed to fetch jobs for ${boardToken}: ${response.statusText}`);
  }

  const data = await response.json() as GreenhouseBoardResponse;
  return data.jobs || [];
}

/**
 * Fetches detailed info for a single job, including questions (form fields).
 */
export async function getJobDetails(boardToken: string, jobId: string): Promise<GreenhouseJobResponse> {
  const url = `${GREENHOUSE_API_BASE}/${boardToken}/jobs/${jobId}?questions=true`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job ${jobId} for ${boardToken}: ${response.statusText}`);
  }

  return await response.json() as GreenhouseJobResponse;
}

/**
 * Submits an application to Greenhouse via POST request.
 * Note: This might be blocked by CORS or Captcha.
 */
export async function submitApplication(boardToken: string, jobId: string, formData: FormData): Promise<any> {
  const url = `${GREENHOUSE_API_BASE}/${boardToken}/jobs/${jobId}`;
  
  // Example for fetching directly. In reality, server-side POST
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // Do not set Content-Type header manually when submitting FormData
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Submit failed: ${response.status} ${errorBody}`);
  }

  return await response.json();
}
