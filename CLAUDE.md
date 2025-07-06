# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube MCP Server is a Model Context Protocol server that enables AI language models to interact with YouTube content. It uses YouTube.js (youtubei.js) to access YouTube's internal API without requiring API keys.

## Key Commands

```bash
# Build the project (TypeScript -> JavaScript)
npm run build

# Run the server (after building)
npm start

# Development mode (auto-rebuild on changes)
npm run dev

# Run tests
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode

# The server can be run via npx:
npx github:acehoss/youtube-mcp-server
```

## Architecture & Important Context

### Module System
This project uses ES modules (`"type": "module"`). When adding imports:
- Always include `.js` extensions for relative imports
- Example: `import { VideoService } from './services/video.js'`

### Service Architecture
The codebase uses a unified service pattern:
- `src/server.ts` sets up the MCP server and routes requests
- `src/services/youtube.ts` handles all YouTube operations using YouTube.js
- The service lazily initializes the Innertube client on first use

### MCP Protocol Implementation
- Uses stdio transport for communication
- Tools are registered in `src/server.ts` with specific parameter schemas
- All YouTube operations are exposed as MCP tools

### Environment Configuration
- No environment variables required
- YouTube.js handles authentication internally

### Build Output
- TypeScript compiles to `dist/` directory
- The CLI entry point (`src/cli.ts`) includes a shebang for direct execution
- The `src/functions/` directory is excluded from the build
- Old service files in `src/services/` (video.ts, channel.ts, etc.) are no longer used

### Type Definitions
Custom type definitions for external libraries without proper types are in `src/types/`:
- `youtube-transcript.d.ts` for the youtube-transcript package

### Deployment Considerations
- Docker deployment uses Node.js 16 Alpine and builds during container creation
- Smithery platform configuration is in `smithery.yaml`
- NPM package includes a CLI binary installed as `zubeid-youtube-mcp-server`

### Common Development Tasks

When modifying YouTube operations:
1. Add/modify methods in `src/services/youtube.ts`
2. Register new tools in `src/server.ts` with proper parameter schemas
3. Define parameter interfaces in `src/types.ts`
4. Write tests for new functionality
5. Run `npm run build` before testing changes

When adding new dependencies:
- Consider ES module compatibility
- Add type definitions if the package lacks them

### Testing Strategy
- Unit tests mock YouTube.js responses
- Integration tests use real API calls (Rick Roll video as primary test case)
- Run `npm test` before committing changes