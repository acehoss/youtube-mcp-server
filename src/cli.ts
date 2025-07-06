#!/usr/bin/env node

import { startMcpServer } from './server.js';

// Start the MCP server
startMcpServer()
    .then(() => {
        console.log('YouTube MCP Server started successfully');
    })
    .catch(error => {
        console.error('Failed to start YouTube MCP Server:', error);
        process.exit(1);
    });
