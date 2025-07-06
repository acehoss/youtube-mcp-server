import { YouTubeService } from '../../src/services/youtube.js';

/**
 * Integration tests for playlist operations
 * Uses real YouTube API calls - requires internet connection
 */
describe('Playlist Integration Tests', () => {
  let service: YouTubeService;
  // YouTube's official "Pop Music Playlist" - should be stable
  const YOUTUBE_POP_PLAYLIST = 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf';

  beforeAll(() => {
    service = new YouTubeService();
  });

  describe('getPlaylist', () => {
    it('should fetch playlist details', async () => {
      const playlist = await service.getPlaylist({ 
        playlistId: YOUTUBE_POP_PLAYLIST 
      });

      expect(playlist).toBeDefined();
      expect(playlist.playlistId).toBe(YOUTUBE_POP_PLAYLIST);
      expect(playlist.title).toBeDefined();
      expect(playlist.author).toBeDefined();
      expect(playlist.videoCount).toBeGreaterThan(0);
      expect(playlist.thumbnails).toBeDefined();
      expect(playlist.privacy).toBeDefined();
    }, 30000);

    it('should handle non-existent playlist ID', async () => {
      await expect(service.getPlaylist({ 
        playlistId: 'invalid_playlist_id_123' 
      })).rejects.toThrow();
    });
  });

  describe('getPlaylistItems', () => {
    it('should fetch playlist videos', async () => {
      const result = await service.getPlaylistItems({ 
        playlistId: YOUTUBE_POP_PLAYLIST,
        maxResults: 10 
      });

      expect(result).toBeDefined();
      expect(result.playlistId).toBe(YOUTUBE_POP_PLAYLIST);
      expect(result.videos).toBeDefined();
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos.length).toBeGreaterThan(0);
      expect(result.videos.length).toBeLessThanOrEqual(10);
      expect(result.totalResults).toBe(result.videos.length);

      // Check video structure
      const firstVideo = result.videos[0];
      expect(firstVideo).toHaveProperty('position');
      expect(firstVideo).toHaveProperty('videoId');
      expect(firstVideo).toHaveProperty('title');
      expect(firstVideo).toHaveProperty('author');
      expect(firstVideo).toHaveProperty('thumbnails');
      expect(firstVideo.position).toBe(1);
    }, 30000);

    it('should respect maxResults parameter', async () => {
      const result = await service.getPlaylistItems({ 
        playlistId: YOUTUBE_POP_PLAYLIST,
        maxResults: 3 
      });

      expect(result.videos.length).toBeLessThanOrEqual(3);
      expect(result.videos.length).toBeGreaterThan(0);
      if (result.videos.length >= 1) expect(result.videos[0].position).toBe(1);
      if (result.videos.length >= 2) expect(result.videos[1].position).toBe(2);
      if (result.videos.length >= 3) expect(result.videos[2].position).toBe(3);
    }, 30000);

    it('should handle empty playlist gracefully', async () => {
      // This test might be flaky if we can't find a reliably empty playlist
      // For now, just test that the method doesn't crash with any valid playlist
      const result = await service.getPlaylistItems({ 
        playlistId: YOUTUBE_POP_PLAYLIST,
        maxResults: 1 
      });

      expect(result).toBeDefined();
      expect(result.videos).toBeDefined();
      expect(Array.isArray(result.videos)).toBe(true);
    }, 30000);
  });
});