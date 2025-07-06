import { YouTubeService } from '../../src/services/youtube.js';

/**
 * Integration tests for channel operations
 * Uses real YouTube API calls - requires internet connection
 */
describe('Channel Integration Tests', () => {
  let service: YouTubeService;
  const RICK_ASTLEY_CHANNEL_ID = 'UCuAXFkgsw1L7xaCfnd5JJOw';

  beforeAll(() => {
    service = new YouTubeService();
  });

  describe('getChannel', () => {
    it('should fetch Rick Astley channel details', async () => {
      const channel = await service.getChannel({ channelId: RICK_ASTLEY_CHANNEL_ID });

      expect(channel).toBeDefined();
      expect(channel.channelId).toBe(RICK_ASTLEY_CHANNEL_ID);
      expect(channel.title).toContain('Rick Astley');
      expect(channel.description).toBeDefined();
      expect(channel.subscriberCount).toBeDefined();
      expect(channel.videoCount).toBeDefined();
      expect(channel.viewCount).toBeDefined();
      expect(channel.thumbnails).toBeDefined();
      expect(channel.isVerified).toBeDefined();
    }, 30000);

    it('should handle non-existent channel ID', async () => {
      await expect(service.getChannel({ channelId: 'invalid_channel_id_123' }))
        .rejects.toThrow();
    });
  });

  describe('listVideos', () => {
    it('should list videos from Rick Astley channel', async () => {
      const result = await service.listVideos({ 
        channelId: RICK_ASTLEY_CHANNEL_ID,
        maxResults: 10 
      });

      expect(result).toBeDefined();
      expect(result.channelId).toBe(RICK_ASTLEY_CHANNEL_ID);
      expect(result.videos).toBeDefined();
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos.length).toBeGreaterThan(0);
      expect(result.videos.length).toBeLessThanOrEqual(10);
      expect(result.totalResults).toBe(result.videos.length);

      // Check video structure
      const firstVideo = result.videos[0];
      expect(firstVideo).toHaveProperty('videoId');
      expect(firstVideo).toHaveProperty('title');
      expect(firstVideo).toHaveProperty('thumbnails');
      
      // Should include the famous Rick Roll video somewhere in recent uploads
      const hasRickRoll = result.videos.some(v => 
        v.title?.toLowerCase().includes('never gonna give you up')
      );
      // Note: This might not always be true if he uploads many new videos
    }, 30000);

    it('should respect maxResults parameter', async () => {
      const result = await service.listVideos({ 
        channelId: RICK_ASTLEY_CHANNEL_ID,
        maxResults: 5 
      });

      expect(result.videos.length).toBeLessThanOrEqual(5);
    }, 30000);
  });
});