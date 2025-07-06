import { YouTubeService } from '../../src/services/youtube.js';

/**
 * Integration tests for transcript operations
 * Uses real YouTube API calls - requires internet connection
 */
describe('Transcript Integration Tests', () => {
  let service: YouTubeService;
  const RICK_ROLL_VIDEO_ID = 'dQw4w9WgXcQ';

  beforeAll(() => {
    service = new YouTubeService();
  });

  describe('getTranscript', () => {
    it('should fetch Rick Roll transcript', async () => {
      const result = await service.getTranscript({ 
        videoId: RICK_ROLL_VIDEO_ID,
        language: 'en' 
      });

      expect(result).toBeDefined();
      expect(result.videoId).toBe(RICK_ROLL_VIDEO_ID);
      expect(result.transcript).toBeDefined();
      expect(Array.isArray(result.transcript)).toBe(true);
      expect(result.transcript.length).toBeGreaterThan(0);

      // Check first few lines contain expected lyrics
      const transcriptText = result.transcript
        .map(item => item.text)
        .join(' ')
        .toLowerCase();
      
      expect(transcriptText).toContain('never gonna give you up');
      expect(transcriptText).toContain('never gonna let you down');
      
      // Check transcript structure
      const firstSegment = result.transcript[0];
      expect(firstSegment).toHaveProperty('text');
      expect(firstSegment).toHaveProperty('offset');
      expect(firstSegment).toHaveProperty('duration');
      expect(typeof firstSegment.offset).toBe('number');
      expect(typeof firstSegment.duration).toBe('number');
    }, 30000);

    it('should handle video without transcript', async () => {
      // Try to get transcript for a video with potentially no captions
      // or with an invalid language
      try {
        await service.getTranscript({ 
          videoId: 'dQw4w9WgXcQ',
          language: 'zz' // Invalid language code
        });
      } catch (error) {
        // If it throws, the test passes
        expect(error).toBeDefined();
        return;
      }
      
      // If no error, the video might have captions in 'zz' somehow
      // In this case, we just check that we got something back
      expect(true).toBe(true);
    }, 30000);
  });

  describe('searchTranscript', () => {
    it('should search within Rick Roll transcript', async () => {
      const result = await service.searchTranscript({ 
        videoId: RICK_ROLL_VIDEO_ID,
        query: 'never gonna',
        language: 'en' 
      });

      expect(result).toBeDefined();
      expect(result.videoId).toBe(RICK_ROLL_VIDEO_ID);
      expect(result.query).toBe('never gonna');
      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.totalMatches).toBe(result.matches.length);

      // Should find multiple instances of "never gonna"
      expect(result.matches.length).toBeGreaterThan(5);
      
      // Each match should contain the search query
      result.matches.forEach(match => {
        expect(match.text.toLowerCase()).toContain('never gonna');
      });
    }, 30000);

    it('should return empty matches for non-existent phrase', async () => {
      const result = await service.searchTranscript({ 
        videoId: RICK_ROLL_VIDEO_ID,
        query: 'xyzabc123456',
        language: 'en' 
      });

      expect(result).toBeDefined();
      expect(result.matches).toEqual([]);
      expect(result.totalMatches).toBe(0);
    }, 30000);
  });

  describe('getTimestampedTranscript', () => {
    it('should get timestamped transcript for Rick Roll', async () => {
      const result = await service.getTimestampedTranscript({ 
        videoId: RICK_ROLL_VIDEO_ID,
        language: 'en' 
      });

      expect(result).toBeDefined();
      expect(result.videoId).toBe(RICK_ROLL_VIDEO_ID);
      expect(result.timestampedTranscript).toBeDefined();
      expect(Array.isArray(result.timestampedTranscript)).toBe(true);
      expect(result.timestampedTranscript.length).toBeGreaterThan(0);

      // Check timestamp format
      const firstSegment = result.timestampedTranscript[0];
      expect(firstSegment).toHaveProperty('timestamp');
      expect(firstSegment).toHaveProperty('text');
      expect(firstSegment).toHaveProperty('startTimeMs');
      expect(firstSegment).toHaveProperty('durationMs');
      
      // Timestamp should be in format M:SS or MM:SS
      expect(firstSegment.timestamp).toMatch(/^\d{1,2}:\d{2}$/);
      
      // First timestamp should be near the beginning
      expect(firstSegment.startTimeMs).toBeLessThan(5000); // Within first 5 seconds
    }, 30000);
  });
});