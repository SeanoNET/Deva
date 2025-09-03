import { LinearClient, Issue, Team, User, WorkflowState, IssueLabel } from '@linear/sdk';
import type { IssueData, WorkType } from '@deva/types';

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

  async createIssue(issueData: IssueData, teamId?: string, options?: {
    assigneeId?: string;
    stateId?: string;
    labelIds?: string[];
    parentId?: string;
  }) {
    const client = this.ensureClient();
    
    // Get default team if not provided
    let finalTeamId = teamId;
    if (!finalTeamId) {
      const teams = await this.getTeams();
      if (teams.nodes.length === 0) {
        throw new Error('No teams found in workspace');
      }
      finalTeamId = teams.nodes[0].id;
    }
    
    // Ensure we have a valid team ID
    if (!finalTeamId) {
      throw new Error('No team ID provided and unable to determine default team');
    }
    
    // Map labels to Linear label IDs if needed
    let labelIds = options?.labelIds || [];
    if (!labelIds.length && issueData.labels?.length) {
      labelIds = await this.getOrCreateLabelIds(issueData.labels);
    }
    
    // Get appropriate workflow state based on work type
    let stateId = options?.stateId;
    if (!stateId) {
      stateId = await this.getDefaultStateForWorkType(issueData.workType, finalTeamId);
    }
    
    const issuePayload = {
      title: issueData.title,
      description: issueData.description,
      priority: this.mapPriority(issueData.priority),
      teamId: finalTeamId,
      ...(options?.assigneeId && { assigneeId: options.assigneeId }),
      ...(stateId && { stateId }),
      ...(labelIds.length && { labelIds }),
      ...(options?.parentId && { parentId: options.parentId }),
    };
    
    const issue = await client.createIssue(issuePayload);
    
    // Wait for the issue to be created and return full details
    const created = await issue.issue;
    return created;
  }

  async updateIssue(id: string, updates: Partial<IssueData>) {
    const client = this.ensureClient();
    
    const updatePayload: any = {};
    
    if (updates.title) updatePayload.title = updates.title;
    if (updates.description) updatePayload.description = updates.description;
    if (updates.priority) updatePayload.priority = this.mapPriority(updates.priority);
    
    if (updates.labels) {
      const labelIds = await this.getOrCreateLabelIds(updates.labels);
      updatePayload.labelIds = labelIds;
    }
    
    const issue = await client.updateIssue(id, updatePayload);
    return issue;
  }

  async searchIssues(query: string, options?: {
    teamId?: string;
    assigneeId?: string;
    limit?: number;
  }) {
    const client = this.ensureClient();
    
    const searchOptions: any = {
      filter: {
        searchableContent: { contains: query },
      },
      first: options?.limit || 10,
    };
    
    if (options?.teamId) {
      searchOptions.filter.team = { id: { eq: options.teamId } };
    }
    
    if (options?.assigneeId) {
      searchOptions.filter.assignee = { id: { eq: options.assigneeId } };
    }
    
    const issues = await client.issues(searchOptions);
    return issues;
  }

  async getWorkspace() {
    const client = this.ensureClient();
    const workspace = await client.organization;
    return workspace;
  }

  async getTeams() {
    const client = this.ensureClient();
    
    try {
      // Get current user and their team memberships directly
      const currentUser = await client.viewer;
      const memberships = await currentUser.teamMemberships();
      const teams = await Promise.all(
        memberships.nodes.map(async (membership: any) => await membership.team)
      );
      
      return {
        nodes: teams,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        }
      };
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      throw new Error('Unable to fetch teams: ' + (error?.message || 'Unknown error'));
    }
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
  
  private async getOrCreateLabelIds(labels: string[]): Promise<string[]> {
    const client = this.ensureClient();
    const existingLabels = await client.issueLabels();
    const labelIds: string[] = [];
    
    for (const labelName of labels) {
      const existing = existingLabels.nodes.find(
        l => l.name.toLowerCase() === labelName.toLowerCase()
      );
      
      if (existing) {
        labelIds.push(existing.id);
      } else {
        // Create new label
        const newLabel = await client.createIssueLabel({
          name: labelName,
          color: this.generateLabelColor(labelName),
        });
        const created = await newLabel.issueLabel;
        if (created) {
          labelIds.push(created.id);
        }
      }
    }
    
    return labelIds;
  }
  
  private generateLabelColor(name: string): string {
    // Generate a consistent color based on the label name
    const colors = [
      '#ff6900', '#fcb900', '#7bdcb5', '#00d084',
      '#8ed1fc', '#0693e3', '#abb8c3', '#eb144c',
      '#f78da7', '#9900ef'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
  
  private async getDefaultStateForWorkType(workType: WorkType, teamId: string): Promise<string | undefined> {
    const client = this.ensureClient();
    
    // Get team's workflow states
    const team = await client.team(teamId);
    const states = await team.states();
    
    // Map work types to state names
    const stateMapping: Record<WorkType, string[]> = {
      bug: ['bug', 'triage', 'backlog'],
      feature: ['backlog', 'todo', 'planned'],
      documentation: ['todo', 'backlog', 'planned'],
      testing: ['todo', 'testing', 'backlog'],
      infrastructure: ['backlog', 'todo', 'planned'],
      research: ['research', 'discovery', 'backlog'],
    };
    
    const preferredStates = stateMapping[workType] || ['backlog', 'todo'];
    
    for (const stateName of preferredStates) {
      const state = states.nodes.find(
        s => s.name.toLowerCase().includes(stateName.toLowerCase())
      );
      if (state) {
        return state.id;
      }
    }
    
    // Return first available state as fallback
    return states.nodes[0]?.id;
  }
  
  async getIssue(id: string): Promise<Issue> {
    const client = this.ensureClient();
    return await client.issue(id);
  }
  
  async getTeamById(id: string): Promise<Team> {
    const client = this.ensureClient();
    return await client.team(id);
  }
  
  async getUserById(id: string): Promise<User> {
    const client = this.ensureClient();
    return await client.user(id);
  }
  
  async getMyUser(): Promise<User> {
    const client = this.ensureClient();
    return await client.viewer;
  }
  
  async getLabels(): Promise<IssueLabel[]> {
    const client = this.ensureClient();
    const labels = await client.issueLabels();
    return labels.nodes;
  }
  
  async getWorkflowStates(teamId?: string): Promise<WorkflowState[]> {
    const client = this.ensureClient();
    
    if (teamId) {
      const team = await client.team(teamId);
      const states = await team.states();
      return states.nodes;
    } else {
      const states = await client.workflowStates();
      return states.nodes;
    }
  }
}