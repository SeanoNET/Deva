# Deva - Your Development Assistant
## MVP Project Brief

### **Vision**
Deva is an intelligent development assistant that transforms natural language ideas into structured Linear work items. Whether you're on-the-go, deep in code, or planning a new project from scratch, Deva helps you create detailed, well-planned issues without breaking your flow.

### **Core Philosophy**
- **AI supplements, never drives** - You maintain full control and situational awareness
- **Frictionless by default** - 90% of interactions should be instant with smart defaults
- **Conversational when needed** - Seamlessly switch to collaborative planning for complex work
- **Learn and adapt** - Deva improves from your corrections and team patterns

### **Target Use Cases**
1. **On-the-go planning** - Capture detailed work items from anywhere
2. **Mid-development workflow** - Create issues without losing coding context  
3. **Feature design** - Build comprehensive user stories through guided conversation
4. **Project inception** - Plan entire projects from initial concept to detailed backlog

---

## **MVP Scope**

### **Core Features**

#### 1. **Intelligent Work Type Detection**
Automatically categorize user input into work types and apply appropriate UX patterns:

| Work Type | Pattern | Behavior |
|-----------|---------|----------|
| 🐛 **Bugs** | Pattern 1 | Auto-create with smart defaults |
| 📖 **Documentation** | Pattern 1 | Auto-create with context awareness |
| 🧪 **Testing** | Pattern 1 | Auto-create with scope detection |
| ✨ **Features** | Pattern 2 | Conversational planning required |
| 🏗️ **Infrastructure** | Pattern 2 | Planning and coordination needed |
| 📚 **Research** | Pattern 2+ | Discovery workflow with phases |

#### 2. **Dual UX Patterns**

**Pattern 1: Invisible Intelligence** (Default for bugs, docs, tests)
```bash
You: "login form crashes on mobile"
🤖 ✅ LIN-445: "Mobile login form crash"
   Frontend • Critical • Sarah • 2pts
   Wrong? Click edit or type changes
```

**Pattern 2: Conversational Planning** (Features, infrastructure)  
```bash
You: "add user notifications"
🤖 User notifications - lots of possibilities!
   What kind of notifications are you thinking?
   [In-app] [Push] [Email] [All of above]
```

#### 3. **Seamless Pattern Transitions**
- Auto-escalate to Pattern 2 when Deva's confidence is low
- Users can force Pattern 2 with edit commands
- Learn from corrections to improve future defaults

#### 4. **Context-Aware Intelligence**
- Analyze current codebase for smart team assignment
- Link related issues automatically  
- Apply team-specific templates and labels
- Learn user and team patterns over time

---

## **Technical Architecture**

### **Core Stack**
- **Next.js 14** (App Router) - Web application framework
- **React 18** - User interface components
- **Convex** - Backend database and real-time sync
- **Claude Code SDK** - Agent orchestration and codebase analysis
- **Linear GraphQL API** - Issue creation, updates, queries
- **Optional CLI** - Power user terminal interface

### **Application Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │    │   Convex DB     │    │  External APIs  │
│                 │    │                 │    │                 │
│ • React UI      │◄──►│ • User prefs    │◄──►│ • Linear API    │
│ • Chat interface│    │ • Issue history │    │ • Claude API    │
│ • Issue preview │    │ • Team patterns │    │ • GitHub API    │
│ • Settings      │    │ • Learning data │    │   (optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲
         │
         ▼
┌─────────────────┐
│   CLI Tool      │
│ (Optional)      │
│                 │
│ • Same backend  │
│ • Power users   │
│ • CI/CD hooks   │
└─────────────────┘
```

### **Key Components**

#### 1. **Web Interface Components**
```typescript
// Main chat interface for issue creation
interface ChatInterface {
  messages: Message[];
  currentIssue?: IssuePreview;
  workType: WorkType;
  pattern: UXPattern;
}

// Issue preview with live editing
interface IssuePreview {
  title: string;
  description: string;
  team?: Team;
  assignee?: User;
  priority: Priority;
  labels: Label[];
  linkedIssues: Issue[];
}
```

#### 2. **Convex Database Schema**
```typescript
// User preferences and learning data
interface UserPreferences {
  userId: string;
  linearWorkspaceId: string;
  defaultTeam?: string;
  workTypePatterns: Record<WorkType, PatternPreferences>;
  teamAssignmentRules: AssignmentRule[];
}

// Issue creation history for learning
interface IssueHistory {
  id: string;
  userId: string;
  originalInput: string;
  workType: WorkType;
  finalIssue: LinearIssue;
  corrections: UserCorrection[];
  createdAt: number;
}
```

#### 3. **Agent Service Layer**
```typescript
interface AgentService {
  processInput(input: string, context: ProjectContext): Promise<IssueResponse>;
  refineIssue(issueId: string, refinement: string): Promise<IssueResponse>;
  learnFromCorrection(correction: UserCorrection): Promise<void>;
  getConversationHistory(userId: string): Promise<Conversation[]>;
}
```

#### 4. **Linear Integration Service**
```typescript
interface LinearService {
  authenticateUser(code: string): Promise<LinearAuth>;
  createIssue(issueData: IssueInput): Promise<LinearIssue>;
  updateIssue(id: string, updates: Partial<IssueInput>): Promise<LinearIssue>;
  searchIssues(query: SearchQuery): Promise<LinearIssue[]>;
  getWorkspace(): Promise<LinearWorkspace>;
}
```

---

## **MVP User Interface Design**

### **Main Chat Interface**
```typescript
// Primary interaction through chat-like interface
interface ChatUI {
  // User types natural language
  input: "mobile login keeps timing out"
  
  // AI responds with issue preview
  response: {
    type: "issue_preview",
    issue: {
      title: "Mobile login timeout issues",
      team: "Backend",
      priority: "High", 
      assignee: "Alex"
    },
    confidence: "high",
    actions: ["create", "edit", "discuss"]
  }
}
```

### **Web UX Patterns**

#### **Pattern 1: Quick Create (Bugs, Docs, Tests)**
```jsx
// User types issue
<ChatInput value="search is slow again" />

// AI shows instant preview
<IssuePreview
  title="Search performance degradation"
  team="Backend"
  priority="High"
  assignee="Alex"
  confidence={95}
>
  <QuickActions>
    <Button primary onClick={createIssue}>Create Issue</Button>
    <Button onClick={editIssue}>Edit Details</Button>
  </QuickActions>
</IssuePreview>
```

#### **Pattern 2: Guided Planning (Features, Infrastructure)**
```jsx
// User requests feature
<ChatInput value="add user notifications" />

// AI starts conversation
<ConversationFlow>
  <AIMessage>
    User notifications - lots of possibilities! 
    What kind are you thinking?
  </AIMessage>
  <OptionButtons>
    <Option value="in-app">In-app only</Option>
    <Option value="push">Push notifications</Option>
    <Option value="email">Email notifications</Option>
    <Option value="all">All of the above</Option>
  </OptionButtons>
</ConversationFlow>
```

### **Key UI Components**

#### **1. Chat Interface**
- **ChatInput**: Natural language input with suggestions
- **MessageList**: Conversation history with AI responses
- **TypingIndicator**: Shows AI is thinking/processing

#### **2. Issue Management**
- **IssuePreview**: Live-editable issue details
- **QuickEditBar**: Inline editing for team, priority, assignee
- **RelatedIssues**: Shows automatically detected links

#### **3. Learning Dashboard**
- **PreferencesPanel**: User and team patterns learned
- **IssueHistory**: Past conversations and corrections
- **TeamInsights**: Usage patterns and suggestions

---

## **Technical Implementation Plan**

### **Phase 1: Core Web App (Weeks 1-2)**
- [ ] Next.js app setup with Convex integration
- [ ] Basic chat interface with message handling
- [ ] Linear OAuth authentication flow
- [ ] Simple work type detection and Pattern 1 implementation
- [ ] Issue preview with create/edit functionality

### **Phase 2: Intelligence & Learning (Weeks 3-4)**
- [ ] Claude Code SDK integration for codebase analysis
- [ ] Team assignment intelligence and suggestions
- [ ] User preference learning and storage in Convex
- [ ] Issue relationship detection and auto-linking

### **Phase 3: Conversational Planning (Weeks 5-6)**
- [ ] Pattern 2 guided conversation flows
- [ ] Feature planning workflows with option selection
- [ ] Epic breakdown and multi-issue creation
- [ ] Seamless pattern switching in web UI

### **Phase 4: CLI & Polish (Week 7)**
- [ ] Optional CLI tool that uses same Convex backend
- [ ] Advanced editing and refinement features
- [ ] Performance optimization and error handling
- [ ] User testing and feedback integration

---

## **Web-Specific Features**

### **Enhanced UX Capabilities**

#### **1. Visual Issue Building**
```jsx
// Live preview as AI suggests changes
<IssueBuilder>
  <Field label="Title" value="Mobile login timeout" editable />
  <Field label="Team" value="Backend" 
    suggestions={["Frontend", "Mobile", "DevOps"]} />
  <Field label="Priority" value="High" 
    options={["Low", "Medium", "High", "Critical"]} />
  <RelatedIssues issues={relatedIssues} />
</IssueBuilder>
```

#### **2. Conversation Branching**
```jsx
// Multiple conversation paths for complex features
<ConversationTree>
  <Branch topic="notification-types">
    <AIQuestion>What types of notifications?</AIQuestion>
    <UserResponse>In-app and push</UserResponse>
  </Branch>
  <Branch topic="triggers">
    <AIQuestion>What should trigger notifications?</AIQuestion>
    <UserResponse>User actions and deadlines</UserResponse>
  </Branch>
  <EpicSummary issues={generatedIssues} />
</ConversationTree>
```

#### **3. Smart Suggestions UI**
```jsx
// Contextual suggestions based on codebase analysis
<SuggestionPanel>
  <Suggestion 
    type="team_assignment"
    reasoning="PaymentService.ts is owned by Backend team"
    confidence={90}
  />
  <Suggestion 
    type="related_epic" 
    epic="Authentication Improvements"
    reasoning="3 similar auth issues this month"
    confidence={75}
  />
</SuggestionPanel>
```

### **Advantages of Web + CLI Approach**

#### **Web App Benefits:**
- **Accessibility**: No terminal knowledge required
- **Visual Feedback**: See issues being built in real-time  
- **Guided Workflows**: Button-driven conversations for complex planning
- **Team Collaboration**: Share conversations and planning sessions
- **Learning Visibility**: Users can see what AI has learned about their patterns

#### **CLI Benefits (Optional):**
- **Speed**: Power users can create issues in seconds
- **Automation**: Hook into CI/CD pipelines and git workflows
- **Scripting**: Batch operations and custom workflows
- **Integration**: Works with existing terminal-based development workflows

### **Deployment Strategy**
- **Web App**: Deploy to Vercel/Netlify with Convex backend
- **CLI**: Publish to npm as optional package
- **Shared Backend**: Both interfaces use same Convex database and logic

## **MVP User Stories**

### **As a developer, I want to...**

1. **Create bug reports through chat** so I don't lose context while coding
   ```
   Web: Type "search timeout on production" → See issue preview → Click create
   CLI: linear "search timeout on production" → Creates bug immediately
   ```

2. **Plan features with guided conversations** so I consider all requirements upfront  
   ```
   Web: "add user profiles" → AI asks questions → Build epic interactively
   CLI: linear "add user profiles" → Guided conversation about scope
   ```

3. **Edit AI suggestions visually** so I maintain control over work planning
   ```
   Web: Click edit on preview → Modify fields inline → Save changes
   CLI: AI creates issue → User types "assign to sarah" → Updated instantly
   ```

4. **Have AI learn my patterns** so defaults improve over time
   ```
   Web: Correct team assignment in UI → AI learns preference
   CLI: User corrects team assignment → AI remembers for similar future issues
   ```

5. **See smart suggestions with context** without being overwhelmed by options
   ```
   Web: AI shows suggestion card: "Link to Epic LIN-234?" with reasoning
   CLI: AI: "I see this relates to Epic LIN-234, link it? (y/n)"
   ```

6. **Access from anywhere** so I can create issues regardless of my current tool
   ```
   • Web app when I'm in browser/planning mode
   • CLI when I'm in terminal/coding mode  
   • Both use same learning and preferences
   ```

---

## **Getting Started**

### **Prerequisites**
- **Anthropic API key** (Claude Code SDK)
- **Linear API key** or OAuth app setup
- **Convex account** for backend database
- **Node.js 18+** environment
- **Next.js 14** development setup

### **Development Setup**
```bash
# Clone and install
git clone [repo-url] linear-agent
cd linear-agent
npm install

# Environment configuration  
cp .env.example .env.local
# Add your API keys:
# ANTHROPIC_API_KEY="your_key"
# LINEAR_CLIENT_ID="your_client_id"
# LINEAR_CLIENT_SECRET="your_client_secret"
# CONVEX_DEPLOYMENT="your_convex_deployment"

# Initialize Convex
npx convex init
npx convex dev

# Start development
npm run dev
```

### **Project Structure**
```
linear-agent/
├── app/                    # Next.js app directory
│   ├── chat/              # Main chat interface
│   ├── auth/              # Linear OAuth flow
│   └── settings/          # User preferences
├── components/            # Reusable UI components
│   ├── chat/             # Chat interface components
│   ├── issues/           # Issue preview/edit components
│   └── ui/               # Base UI components
├── convex/               # Convex backend functions
│   ├── issues.ts         # Issue CRUD operations
│   ├── users.ts          # User preferences
│   └── agent.ts          # AI agent logic
├── lib/                  # Utility libraries
│   ├── linear.ts         # Linear API client
│   ├── claude.ts         # Claude Code SDK
│   └── types.ts          # TypeScript definitions
└── cli/                  # Optional CLI tool
    └── index.ts          # CLI interface using same backend
```

### **First Implementation Target**
```typescript
// Week 1 milestone: Basic web chat works
// User opens app, authenticates with Linear
// Types: "mobile app crashes on startup"  
// Sees issue preview with smart defaults
// Clicks "Create Issue" → Creates in Linear
// Shows success confirmation with Linear link
```

This architecture gives you the best of both worlds: an accessible web interface for most users and a powerful CLI for developers who prefer terminal workflows, all backed by the same intelligent agent and learning system.

This MVP focuses on proving the core UX concept: AI that intelligently adapts to work types while keeping humans in complete control of their project planning process.