# Deva - Intelligent Development Assistant

Deva transforms natural language into structured Linear work items using AI-driven patterns and conversational interfaces.

## 🏗️ Architecture

This project uses a **Turborepo monorepo** structure with:
- **Web App**: Next.js 14 application for the main interface
- **CLI Tool**: Command-line interface for power users
- **Shared Packages**: Reusable code across both applications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PNPM 9.0+ (install with `npm install -g pnpm`)
- Linear account for API access
- Claude Code subscription (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SeanoNET/Deva.git
cd Deva
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

4. Initialize Convex (optional, for backend):
```bash
cd apps/web
npx convex init
cd ../..
```

### Development

Run all applications in development mode:
```bash
pnpm dev
```

Or run specific apps:
```bash
# Web application only
pnpm --filter @deva/web dev

# CLI tool only
pnpm --filter @deva/cli dev
```

### Building

Build all packages and applications:
```bash
pnpm build
```

## 📁 Project Structure

```
deva/
├── apps/
│   ├── web/              # Next.js web application
│   └── cli/              # CLI tool
├── packages/
│   ├── @deva/types/      # TypeScript type definitions
│   ├── @deva/linear/     # Linear API client
│   ├── @deva/ai/         # AI integration (Claude)
│   ├── @deva/convex-shared/ # Shared Convex schemas
│   └── @deva/utils/      # Utility functions
├── turbo.json            # Turborepo configuration
├── package.json          # Root package configuration
└── pnpm-workspace.yaml   # PNPM workspace configuration
```

## 🎯 Features

### Pattern 1: Quick Create (Bugs, Docs, Tests)
- Instant issue creation with smart defaults
- High-confidence AI detection
- One-click creation flow

### Pattern 2: Conversational Planning (Features, Infrastructure)
- Guided conversation for complex work items
- Interactive refinement process
- Epic breakdown capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Convex (real-time database)
- **AI**: Anthropic Claude API
- **APIs**: Linear GraphQL API
- **Build**: Turborepo, PNPM, TypeScript
- **CLI**: Commander.js, Inquirer

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Lint all code |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean all build artifacts |

## 🔧 Configuration

### Linear API Setup
1. Go to Linear Settings → API → Personal API keys
2. Create a new personal API key
3. Add to `.env.local` as `LINEAR_API_KEY`

### AI Setup
The AI features use Claude Code's built-in capabilities. No separate API key is needed when running with Claude Code.

### Convex Setup
1. Create account at [Convex](https://convex.dev)
2. Run `npx convex init` in `apps/web`
3. Follow the setup wizard

## 📚 Documentation

- [Project Brief](./deva-brief.md) - Complete project specification
- [Task Tracking](./TASKS.md) - Implementation progress
- [Agent Guide](./CLAUDE.md) - Instructions for AI agents

## 🤝 Contributing

Please read [CLAUDE.md](./CLAUDE.md) for development guidelines and workflow instructions.

## 📄 License

MIT

## 🙋 Support

For issues and questions, please use the GitHub issues page.