import { YouTubeService } from '../../../src/services/youtube.js';
import { jest } from '@jest/globals';

// Mock youtubei.js
jest.mock('youtubei.js', () => {
  return {
    Innertube: {
      create: jest.fn()
    }
  };
});

describe('YouTubeService', () => {
  let service: YouTubeService;
  let mockInnertube: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Innertube instance
    mockInnertube = {
      getInfo: jest.fn(),
      search: jest.fn(),
      getChannel: jest.fn(),
      getPlaylist: jest.fn(),
      getTrending: jest.fn()
    };

    // Mock Innertube.create to return our mock instance
    const youtubeiJs = require('youtubei.js');
    const mockCreate = youtubeiJs.Innertube.create as jest.MockedFunction<any>;
    mockCreate.mockResolvedValue(mockInnertube);

    service = new YouTubeService();
  });

  describe('getVideo', () => {
    it('should fetch video details successfully', async () => {
      const mockVideoInfo = {
        basic_info: {
          id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          short_description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
          author: 'Rick Astley',
          channel_id: 'UCuAXFkgsw1L7xaCfnd5JJOw',
          duration: 212,
          view_count: 1400000000,
          like_count: 15000000,
          start_timestamp: '2009-10-25T06:57:33Z',
          thumbnail: [{ url: 'https://example.com/thumb.jpg' }],
          is_live: false,
          is_private: false,
          is_unlisted: false,
          category: 'Music',
          keywords: ['rick', 'astley', 'never', 'gonna', 'give', 'you', 'up'],
          embed: { iframe_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        }
      };

      mockInnertube.getInfo.mockResolvedValue(mockVideoInfo);

      const result = await service.getVideo({ videoId: 'dQw4w9WgXcQ' });

      expect(result).toEqual({
        videoId: 'dQw4w9WgXcQ',
        title: 'Never Gonna Give You Up',
        description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
        author: 'Rick Astley',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        duration: 212,
        viewCount: 1400000000,
        likeCount: 15000000,
        publishedAt: '2009-10-25T06:57:33Z',
        thumbnails: [{ url: 'https://example.com/thumb.jpg' }],
        isLive: false,
        isPrivate: false,
        isUnlisted: false,
        category: 'Music',
        keywords: ['rick', 'astley', 'never', 'gonna', 'give', 'you', 'up'],
        embedHtml: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      });
      
      expect(mockInnertube.getInfo).toHaveBeenCalledWith('dQw4w9WgXcQ');
    });

    it('should handle errors when fetching video', async () => {
      mockInnertube.getInfo.mockRejectedValue(new Error('Video not found'));

      await expect(service.getVideo({ videoId: 'invalid' }))
        .rejects.toThrow('Failed to get video: Video not found');
    });
  });

  describe('searchVideos', () => {
    it('should search videos successfully', async () => {
      const mockSearchResults = {
        videos: [
          {
            id: 'dQw4w9WgXcQ',
            title: { text: 'Never Gonna Give You Up' },
            snippets: [{ text: 'Official music video' }],
            author: { name: 'Rick Astley', id: 'UCuAXFkgsw1L7xaCfnd5JJOw' },
            duration: { seconds: 212 },
            view_count: { text: '1.4B views' },
            published: { text: '14 years ago' },
            thumbnails: [{ url: 'https://example.com/thumb.jpg' }]
          }
        ]
      };

      mockInnertube.search.mockResolvedValue(mockSearchResults);

      const result = await service.searchVideos({ query: 'rick roll', maxResults: 10 });

      expect(result).toEqual({
        query: 'rick roll',
        totalResults: 1,
        videos: [
          {
            videoId: 'dQw4w9WgXcQ',
            title: 'Never Gonna Give You Up',
            description: 'Official music video',
            author: 'Rick Astley',
            channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
            duration: 212,
            viewCount: '1.4B views',
            publishedAt: '14 years ago',
            thumbnails: [{ url: 'https://example.com/thumb.jpg' }]
          }
        ]
      });

      expect(mockInnertube.search).toHaveBeenCalledWith('rick roll', {
        type: 'video'
      });
    });
  });

  describe('getTranscript', () => {
    it('should fetch transcript successfully', async () => {
      const mockVideoInfo = {
        basic_info: { id: 'dQw4w9WgXcQ' },
        captions: {
          caption_tracks: [
            { language_code: 'en', name: 'English' },
            { language_code: 'es', name: 'Spanish' }
          ]
        },
        getTranscript: jest.fn<any>().mockResolvedValue({
          transcript: {
            content: {
              body: {
                initial_segments: [
                  {
                    snippet: { text: "We're no strangers to love" },
                    start_ms: 0,
                    end_ms: 3000
                  },
                  {
                    snippet: { text: "You know the rules and so do I" },
                    start_ms: 3000,
                    end_ms: 6000
                  }
                ]
              }
            }
          }
        })
      };

      mockInnertube.getInfo.mockResolvedValue(mockVideoInfo);

      const result = await service.getTranscript({ videoId: 'dQw4w9WgXcQ', language: 'en' });

      expect(result).toEqual({
        videoId: 'dQw4w9WgXcQ',
        language: 'en',
        transcript: [
          {
            text: "We're no strangers to love",
            offset: 0,
            duration: 3000
          },
          {
            text: "You know the rules and so do I",
            offset: 3000,
            duration: 3000
          }
        ]
      });

      expect(mockVideoInfo.getTranscript).toHaveBeenCalled();
    });

    it('should fallback to first available language if requested not found', async () => {
      const mockVideoInfo = {
        basic_info: { id: 'dQw4w9WgXcQ' },
        captions: {
          caption_tracks: [
            { language_code: 'es', name: 'Spanish' }
          ]
        },
        getTranscript: jest.fn<any>().mockResolvedValue({
          transcript: {
            content: {
              body: {
                initial_segments: [
                  {
                    snippet: { text: 'Hola' },
                    start_ms: 0,
                    end_ms: 1000
                  }
                ]
              }
            }
          }
        })
      };

      mockInnertube.getInfo.mockResolvedValue(mockVideoInfo);

      const result = await service.getTranscript({ videoId: 'dQw4w9WgXcQ', language: 'en' });

      expect(result.language).toBe('es');
      expect(mockVideoInfo.getTranscript).toHaveBeenCalled();
    });

    it('should throw error if no transcripts available', async () => {
      const mockVideoInfo = {
        basic_info: { id: 'dQw4w9WgXcQ' },
        captions: { caption_tracks: [] }
      };

      mockInnertube.getInfo.mockResolvedValue(mockVideoInfo);

      await expect(service.getTranscript({ videoId: 'dQw4w9WgXcQ' }))
        .rejects.toThrow('Failed to get transcript: No transcript available for this video');
    });
  });

  describe('getChannel', () => {
    it('should fetch channel details successfully', async () => {
      const mockChannel = {
        metadata: {
          external_id: 'UCuAXFkgsw1L7xaCfnd5JJOw',
          title: 'Rick Astley',
          description: 'Official Rick Astley YouTube Channel',
          subscriber_count: '3.5M',
          video_count: 150,
          view_count: '1.5B',
          thumbnail: [{ url: 'https://example.com/channel.jpg' }],
          is_verified: true,
          vanity_channel_url: 'https://youtube.com/@RickAstley'
        },
        header: {
          banner: [{ url: 'https://example.com/banner.jpg' }]
        }
      };

      mockInnertube.getChannel.mockResolvedValue(mockChannel);

      const result = await service.getChannel({ channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw' });

      expect(result).toEqual({
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        title: 'Rick Astley',
        description: 'Official Rick Astley YouTube Channel',
        subscriberCount: '3.5M',
        videoCount: 150,
        viewCount: '1.5B',
        thumbnails: [{ url: 'https://example.com/channel.jpg' }],
        banners: [{ url: 'https://example.com/banner.jpg' }],
        isVerified: true,
        customUrl: 'https://youtube.com/@RickAstley'
      });
    });
  });

  describe('getPlaylist', () => {
    it('should fetch playlist details successfully', async () => {
      const mockPlaylist = {
        id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        info: {
          title: 'Best of Rick Astley',
          description: 'Greatest hits',
          author: { name: 'Rick Astley', id: 'UCuAXFkgsw1L7xaCfnd5JJOw' },
          total_items: 25,
          view_count: '10M',
          last_updated: '2023-01-01',
          thumbnails: [{ url: 'https://example.com/playlist.jpg' }],
          is_editable: false,
          privacy: 'public'
        },
        items: []
      };

      mockInnertube.getPlaylist.mockResolvedValue(mockPlaylist);

      const result = await service.getPlaylist({ playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' });

      expect(result).toEqual({
        playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        title: 'Best of Rick Astley',
        description: 'Greatest hits',
        author: 'Rick Astley',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        videoCount: 25,
        viewCount: '10M',
        lastUpdated: '2023-01-01',
        thumbnails: [{ url: 'https://example.com/playlist.jpg' }],
        isEditable: false,
        privacy: 'public'
      });
    });
  });
});