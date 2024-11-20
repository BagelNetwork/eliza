// bagel_client.ts
import { Settings, Client } from 'bagelml';

class BagelClient {
  private client: Client;
  
  constructor(apiKey: string, serverHost: string) {
    const settings = new Settings({
      bagel_api_impl: 'rest',
      bagel_server_host: serverHost,
    });
    this.client = new Client(settings);
    this.client.setApiKey(apiKey);
  }
  
  async createAsset(payload: any): Promise<string> {
    const response = await this.client.create_asset(payload);
    return response.asset_id;
  }
  
  async uploadFile(assetId: string, filePath: string): Promise<void> {
    await this.client.add_file(assetId, filePath);
  }
  
  async fineTune(payload: any): Promise<string> {
    const response = await this.client.fine_tune(payload);
    return response.asset_id;
  }
  
  async getJobByAssetId(assetId: string): Promise<any> {
    const job = await this.client.get_job_by_asset(assetId);
    return job;
  }
  
  async getJob(jobId: string): Promise<any> {
    const result = await this.client.get_job(jobId);
    return result;
  }
  
  async listJobs(userId: string): Promise<any> {
    const jobs = await this.client.list_jobs(userId);
    return jobs;
  }
  
  async downloadModelFile(assetId: string, fileName: string): Promise<any> {
    const fileContent = await this.client.download_model_file(assetId, fileName);
    return fileContent;
  }
}

export default BagelClient;