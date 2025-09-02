import { LinearClient } from '@linear/sdk';
import type { IssueData } from '@deva/types';

export class LinearService {
  private client: LinearClient | null = null;

  constructor(apiKey?: string) {
    // API key is optional - can be set later or use OAuth token
    if (apiKey) {
      this.client = new LinearClient({ apiKey });
    }
  }
  
  // Method to initialize with OAuth token
  initWithOAuth(accessToken: string) {
    this.client = new LinearClient({ accessToken });
  }
  
  // Method to check if client is initialized
  private ensureClient() {
    if (!this.client) {
      throw new Error('Linear client not initialized. Please provide API key or OAuth token.');
    }
    return this.client;
  }

  async createIssue(issueData: IssueData, teamId: string) {
    const client = this.ensureClient();
    // TODO: Add full implementation with team assignment
    const issue = await client.createIssue({
      title: issueData.title,
      description: issueData.description,
      priority: this.mapPriority(issueData.priority),
      teamId: teamId, // Linear requires teamId
    });
    return issue;
  }

  async updateIssue(_id: string, _updates: Partial<IssueData>) {
    // TODO: Implement issue update
    // Will use id and updates parameters when implemented
  }

  async searchIssues(_query: string) {
    // TODO: Implement issue search
    // Will use query parameter when implemented
  }

  async getWorkspace() {
    const client = this.ensureClient();
    const workspace = await client.organization;
    return workspace;
  }

  async getTeams() {
    const client = this.ensureClient();
    const teams = await client.teams();
    return teams;
  }

  async getUsers() {
    const client = this.ensureClient();
    const users = await client.users();
    return users;
  }

  private mapPriority(priority: IssueData['priority']): number {
    const map = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return map[priority];
  }
}