# YouTube MCP Server

A Model Context Protocol (MCP) server implementation for YouTube, enabling AI language models to interact with YouTube content through a standardized interface. This server uses YouTube.js (youtubei.js) to access YouTube's internal API, eliminating the need for API keys.

## Features

### Video Information
* Get video details (title, description, duration, etc.)
* Search videos across YouTube
* Get trending videos
* Get related videos for any video

### Transcript Management
* Retrieve video transcripts
* Support for multiple languages
* Get timestamped captions
* Search within transcripts

### Channel Management
* Get channel details
* List channel videos
* Get channel statistics

### Playlist Management
* Get playlist details
* List playlist items
* Get playlist statistics

## Installation

### Quick Setup for Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["github:acehoss/youtube-mcp-server"]
    }
  }
}
```

That's it! No API keys or additional configuration required.

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/acehoss/youtube-mcp-server.git
cd youtube-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
npm start
```

## Usage Examples

The MCP server exposes the following tools:

### Video Operations

- `videos_getVideo` - Get detailed information about a YouTube video
- `videos_searchVideos` - Search for videos on YouTube
- `transcripts_getTranscript` - Get the transcript of a video
- `videos_getTrending` - Get trending videos
- `videos_getRelated` - Get videos related to a specific video

### Channel Operations

- `channels_getChannel` - Get channel information
- `channels_listVideos` - List videos from a channel

### Playlist Operations

- `playlists_getPlaylist` - Get playlist information
- `playlists_getPlaylistItems` - Get videos in a playlist

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Architecture

This server uses YouTube.js (youtubei.js) to interact with YouTube's internal InnerTube API. This approach:
- Eliminates the need for API keys
- Provides access to features not available in the official API
- Offers better performance for transcript retrieval
- Reduces rate limiting concerns

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Mock YouTube.js responses to test service logic
- **Integration Tests**: Real API calls using known test data (e.g., Rick Astley's "Never Gonna Give You Up")

Integration tests require an internet connection and may take longer to run.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on [YouTube.js](https://github.com/LuanRT/YouTube.js) by LuanRT
- Implements the [Model Context Protocol](https://modelcontextprotocol.io/) specification