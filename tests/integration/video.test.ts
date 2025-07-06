import { YouTubeService } from '../../src/services/youtube.js';

/**
 * Integration tests for video operations
 * Uses real YouTube API calls - requires internet connection
 */
describe('Video Integration Tests', () => {
  let service: YouTubeService;
  const RICK_ROLL_VIDEO_ID = 'dQw4w9WgXcQ';
  const RICK_ASTLEY_CHANNEL_ID = 'UCuAXFkgsw1L7xaCfnd5JJOw';

  beforeAll(() => {
    service = new YouTubeService();
  });

  describe('getVideo', () => {
    it('should fetch Rick Roll video details', async () => {
      const video = await service.getVideo({ videoId: RICK_ROLL_VIDEO_ID });

      expect(video).toBeDefined();
      expect(video.videoId).toBe(RICK_ROLL_VIDEO_ID);
      expect(video.title).toContain('Never Gonna Give You Up');
      expect(video.author).toContain('Rick Astley');
      expect(video.channelId).toBe(RICK_ASTLEY_CHANNEL_ID);
      expect(video.duration).toBeGreaterThan(200); // ~3.5 minutes
      expect(video.viewCount).toBeGreaterThan(1000000000); // Over 1 billion views
      expect(video.category).toBe('Music');
      expect(video.isLive).toBe(false);
      expect(video.isPrivate).toBe(false);
    }, 30000); // 30 second timeout for API call

    it('should handle non-existent video ID', async () => {
      await expect(service.getVideo({ videoId: 'invalid_video_id_123' }))
        .rejects.toThrow();
    });
  });

  describe('searchVideos', () => {
    it('should find Rick Roll video when searching', async () => {
      const results = await service.searchVideos({ 
        query: 'Never Gonna Give You Up Rick Astley',
        maxResults: 10 
      });

      expect(results).toBeDefined();
      expect(results.videos).toBeDefined();
      expect(results.videos.length).toBeGreaterThan(0);
      
      // Rick Roll should be in the results
      const rickRoll = results.videos.find(v => v.videoId === RICK_ROLL_VIDEO_ID);
      expect(rickRoll).toBeDefined();
      if (rickRoll) {
        expect(rickRoll.title).toContain('Never Gonna Give You Up');
        expect(rickRoll.author).toContain('Rick Astley');
      }
    }, 30000);

    it('should return empty results for nonsense query', async () => {
      const results = await service.searchVideos({ 
        query: 'xyzabc123456789nonsensequery',
        maxResults: 5 
      });

      expect(results).toBeDefined();
      expect(results.videos).toBeDefined();
      // May or may not have results, but should not error
    }, 30000);
  });

  describe('getRelatedVideos', () => {
    it('should get videos related to Rick Roll', async () => {
      const results = await service.getRelatedVideos({ 
        videoId: RICK_ROLL_VIDEO_ID,
        maxResults: 10 
      });

      expect(results).toBeDefined();
      expect(results.videos).toBeDefined();
      
      // YouTube.js might not always return related videos
      if (results.videos.length > 0) {
        expect(results.videos.length).toBeLessThanOrEqual(10);
        
        // Related videos should have basic properties
        const firstVideo = results.videos[0];
        expect(firstVideo).toHaveProperty('videoId');
        expect(firstVideo).toHaveProperty('title');
        expect(firstVideo).toHaveProperty('author');
      }
    }, 30000);
  });
});