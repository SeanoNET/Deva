# CLAUDE.md - Deva Project Agent Instructions

## Project Context
You are working on **Deva**, an intelligent development assistant that transforms natural language into structured Linear work items. This document provides essential context and guidelines for any AI agent working on this project.

## Project Architecture
**Monorepo Structure**: This project uses Turborepo with PNPM workspaces for managing multiple applications and shared packages.

## Critical Files
- **deva-brief.md**: Complete project specification and vision
- **TASKS.md**: Detailed task breakdown with completion tracking
- **CLAUDE.md**: This file - agent instructions and context
- **turbo.json**: Turborepo pipeline configuration
- **pnpm-workspace.yaml**: Workspace configuration

## Project Structure
```
deva/
├── apps/
│   ├── web/              # Next.js 14 web application
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Web-specific components
│   │   └── convex/       # Convex backend functions
│   │
│   └── cli/              # CLI tool
│       └── src/          # CLI commands and logic
│
├── packages/
│   ├── @deva/types/      # Shared TypeScript interfaces
│   ├── @deva/linear/     # Linear API client wrapper
│   ├── @deva/ai/         # Claude AI integration
│   ├── @deva/convex-shared/ # Shared Convex schemas
│   └── @deva/utils/      # Utility functions
│
├── turbo.json            # Turborepo configuration
├── package.json          # Root workspace configuration
└── pnpm-workspace.yaml   # PNPM workspace configuration
```

## Development Workflow

### Before Starting Any Work
1. **Check package manager**: This project uses PNPM (not npm or yarn)
2. **Read TASKS.md** to understand current progress
3. **Identify the next uncompleted task** in sequence
4. **Check dependencies** - ensure prerequisite tasks are marked [✅]
5. **Update task status** to [🔄] when starting work

### Working with the Monorepo

#### Installing Dependencies
```bash
# Install all dependencies for all packages
pnpm install

# Add a dependency to a specific app/package
pnpm --filter @deva/web add <package-name>
pnpm --filter @deva/cli add <package-name>
pnpm --filter @deva/types add -D <dev-package-name>
```

#### Running Commands
```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @deva/web dev
pnpm --filter @deva/cli dev

# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter @deva/linear build

# Run tests across all packages
pnpm test

# Lint all code
pnpm lint
```

#### Package Development
When working on shared packages:
1. **Build packages first**: Shared packages must be built before apps can use them
2. **Use workspace protocol**: Dependencies use `workspace:*` in package.json
3. **Watch mode**: Use `pnpm dev` in packages for automatic rebuilds
4. **Type safety**: Changes in @deva/types automatically propagate

### Key Technical Stack
- **Monorepo Tool**: Turborepo with PNPM workspaces
- **Web Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Backend**: Convex for real-time database
- **AI**: Anthropic Claude API
- **Linear Integration**: @linear/sdk
- **CLI Framework**: Commander.js
- **TypeScript**: Strict mode enabled
- **Build Tool**: tsup for packages, Next.js for web

### Turborepo Pipeline
Defined in `turbo.json`:
- **build**: Builds depend on dependencies being built first
- **dev**: Runs in parallel with no caching
- **test**: Runs after build completes
- **lint**: Can run in parallel
- **type-check**: Runs after dependencies are built

### Shared Package Guidelines

#### @deva/types
- Central source of truth for all TypeScript interfaces
- No runtime code, only type definitions
- Used by all other packages and apps

#### @deva/linear
- Wraps the @linear/sdk
- Provides typed methods for Linear operations
- Handles authentication and error handling

#### @deva/ai
- Integrates with Anthropic Claude API
- Handles work type detection and pattern matching
- Manages AI conversation state

#### @deva/convex-shared
- Defines Convex database schema
- Shared validators and types
- Common Convex functions

#### @deva/utils
- Shared utility functions
- Formatting helpers
- Validation functions
- No external dependencies except types

### Environment Variables
Create `.env.local` in the root and apps/web:
```
ANTHROPIC_API_KEY=
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

### Common Commands Reference
```bash
# Development
pnpm dev                  # Start all apps and watch packages
pnpm --filter web dev     # Start only web app
pnpm --filter cli dev     # Start only CLI

# Building
pnpm build               # Build everything
pnpm --filter @deva/* build  # Build all packages

# Testing
pnpm test                # Run all tests
pnpm test:watch          # Watch mode

# Linting
pnpm lint                # Lint all code
pnpm format              # Format with Prettier

# Type Checking
pnpm type-check          # Check TypeScript in all packages

# Clean
pnpm clean               # Clean all build artifacts
```

### When Adding New Features
1. **Determine package location**:
   - Shared logic → packages/
   - Web-specific → apps/web/
   - CLI-specific → apps/cli/

2. **Update dependencies**:
   - Use `pnpm --filter <package> add <dependency>`
   - Keep versions consistent across packages

3. **Build order matters**:
   - Packages must build before apps
   - Turborepo handles this automatically

4. **Test in isolation**:
   - Each package should be independently testable
   - Use `pnpm --filter <package> test`

### Troubleshooting

#### Common Issues
1. **Import errors**: Ensure packages are built (`pnpm build`)
2. **Type errors**: Rebuild @deva/types package
3. **Dependency issues**: Run `pnpm install` at root
4. **Convex errors**: Check CONVEX_DEPLOYMENT is set

#### Build Order
If you encounter build errors:
```bash
# Clean everything
pnpm clean
rm -rf node_modules
pnpm install

# Build in order
pnpm --filter @deva/types build
pnpm --filter @deva/utils build
pnpm --filter @deva/linear build
pnpm --filter @deva/ai build
pnpm --filter @deva/convex-shared build
pnpm build
```

### Success Criteria for Tasks
Each task should:
1. **Build successfully**: No TypeScript or build errors
2. **Follow conventions**: Consistent with existing code
3. **Update TASKS.md**: Mark completed items
4. **Test changes**: Verify functionality works
5. **Document decisions**: Add comments for complex logic

### Human Sign-off Checklist
When requesting human review, provide:
- [ ] What was implemented
- [ ] How to test the changes
- [ ] Any deviations from plan
- [ ] Known issues or limitations
- [ ] Next recommended steps

## Remember
- **Use PNPM**, not npm or yarn
- **Build packages** before running apps
- **Update TASKS.md** continuously
- **Follow monorepo** structure
- **Test changes** in isolation
- **Request review** at milestones

This is a living document. Update it with important decisions, patterns, or clarifications as the project evolves.