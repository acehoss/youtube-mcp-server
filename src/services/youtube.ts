import { Innertube } from 'youtubei.js';
import type { 
  VideoParams, 
  SearchParams, 
  TranscriptParams, 
  SearchTranscriptParams,
  ChannelParams,
  ChannelVideosParams,
  PlaylistParams,
  PlaylistItemsParams
} from '../types.js';

/**
 * Unified YouTube service using YouTube.js (youtubei.js)
 */
export class YouTubeService {
  private innertube: Innertube | null = null;
  private initialized = false;

  constructor() {
    // Lazy initialization
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      this.innertube = await Innertube.create({
        generate_session_locally: true
      });
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize YouTube service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async ensureInitialized() {
    if (!this.initialized || !this.innertube) {
      await this.initialize();
    }
    if (!this.innertube) {
      throw new Error('YouTube service failed to initialize');
    }
  }

  /**
   * Get video details
   */
  async getVideo({ videoId }: VideoParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const info = await this.innertube!.getInfo(videoId);
      
      return {
        videoId: info.basic_info.id,
        title: info.basic_info.title,
        description: info.basic_info.short_description,
        author: info.basic_info.author,
        channelId: info.basic_info.channel_id,
        duration: info.basic_info.duration,
        viewCount: info.basic_info.view_count,
        likeCount: info.basic_info.like_count,
        publishedAt: info.basic_info.start_timestamp,
        thumbnails: info.basic_info.thumbnail,
        isLive: info.basic_info.is_live,
        isPrivate: info.basic_info.is_private,
        isUnlisted: info.basic_info.is_unlisted,
        category: info.basic_info.category,
        keywords: info.basic_info.keywords,
        embedHtml: info.basic_info.embed?.iframe_url
      };
    } catch (error) {
      throw new Error(`Failed to get video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search for videos
   */
  async searchVideos({ query, maxResults = 20 }: SearchParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const search = await this.innertube!.search(query, { 
        type: 'video'
      });
      
      const videos = (search.videos || []).map((video: any) => ({
        videoId: video.id,
        title: video.title?.text || video.title || '',
        description: video.snippets?.[0]?.text || '',
        author: video.author?.name || '',
        channelId: video.author?.id || '',
        duration: video.duration?.seconds || 0,
        viewCount: video.view_count?.text || '0',
        publishedAt: video.published?.text || '',
        thumbnails: video.thumbnails || []
      }));
      
      return {
        query,
        totalResults: videos.length,
        videos
      };
    } catch (error) {
      throw new Error(`Failed to search videos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get video transcript
   */
  async getTranscript({ videoId, language = 'en' }: TranscriptParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const info = await this.innertube!.getInfo(videoId);
      
      // Check if video has captions
      if (!info.captions) {
        throw new Error('No transcript available for this video');
      }
      
      // Get available caption tracks
      const captionTracks = info.captions.caption_tracks || [];
      
      if (captionTracks.length === 0) {
        throw new Error('No transcript available for this video');
      }
      
      // Find the requested language or fallback to first available
      let selectedTrack = captionTracks.find((track: any) => 
        track.language_code?.toLowerCase() === language.toLowerCase()
      );
      
      if (!selectedTrack) {
        selectedTrack = captionTracks[0];
      }
      
      // Fetch the transcript
      const transcript = await info.getTranscript();
      
      // Handle different transcript response formats
      let segments: any[] = [];
      
      if (transcript?.transcript?.content?.body?.initial_segments) {
        segments = transcript.transcript.content.body.initial_segments;
      } else if ((transcript as any)?.content?.body?.initial_segments) {
        segments = (transcript as any).content.body.initial_segments;
      } else if (Array.isArray(transcript)) {
        segments = transcript;
      }
      
      return {
        videoId,
        language: selectedTrack.language_code,
        transcript: segments.map((segment: any) => ({
          text: segment.snippet?.text || segment.text || '',
          offset: parseInt(segment.start_ms || segment.offset || '0'),
          duration: parseInt(segment.duration || ((segment.end_ms || 0) - (segment.start_ms || 0)) || '0')
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get transcript: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search within transcript
   */
  async searchTranscript({ videoId, query, language = 'en' }: SearchTranscriptParams): Promise<any> {
    try {
      const { transcript } = await this.getTranscript({ videoId, language });
      
      const matches = transcript.filter((item: any) => 
        item.text.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        videoId,
        query,
        matches,
        totalMatches: matches.length
      };
    } catch (error) {
      throw new Error(`Failed to search transcript: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get channel details
   */
  async getChannel({ channelId }: ChannelParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const channel = await this.innertube!.getChannel(channelId);
      
      return {
        channelId: channel.metadata.external_id || channelId,
        title: channel.metadata.title || '',
        description: channel.metadata.description || '',
        subscriberCount: (channel as any).metadata?.subscriber_count || 'N/A',
        videoCount: (channel as any).metadata?.video_count || 0,
        viewCount: (channel as any).metadata?.view_count || 'N/A',
        thumbnails: channel.metadata.thumbnail || [],
        banners: (channel.header as any)?.banner || [],
        isVerified: (channel as any).metadata?.is_verified || false,
        customUrl: channel.metadata.vanity_channel_url || ''
      };
    } catch (error) {
      throw new Error(`Failed to get channel: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List channel videos
   */
  async listVideos({ channelId, maxResults = 50 }: ChannelVideosParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const channel = await this.innertube!.getChannel(channelId);
      const videosTab = await channel.getVideos();
      
      const videos = (videosTab.videos || []).slice(0, maxResults).map((video: any) => ({
        videoId: video.id,
        title: video.title?.text || video.title || '',
        description: video.snippets?.[0]?.text || '',
        duration: video.duration?.seconds || 0,
        viewCount: video.view_count?.text || '0',
        publishedAt: video.published?.text || '',
        thumbnails: video.thumbnails || []
      }));
      
      return {
        channelId,
        totalResults: videos.length,
        videos
      };
    } catch (error) {
      throw new Error(`Failed to list channel videos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get playlist details
   */
  async getPlaylist({ playlistId }: PlaylistParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const playlist = await this.innertube!.getPlaylist(playlistId);
      
      return {
        playlistId: (playlist as any).id || playlistId,
        title: playlist.info.title || '',
        description: playlist.info.description || '',
        author: playlist.info.author?.name || '',
        channelId: playlist.info.author?.id || '',
        videoCount: parseInt(playlist.info.total_items || '0'),
        viewCount: (playlist.info as any).view_count || (playlist.info as any).views || 'N/A',
        lastUpdated: playlist.info.last_updated || '',
        thumbnails: playlist.info.thumbnails || [],
        isEditable: playlist.info.is_editable || false,
        privacy: playlist.info.privacy || 'unknown'
      };
    } catch (error) {
      throw new Error(`Failed to get playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get playlist items
   */
  async getPlaylistItems({ playlistId, maxResults = 50 }: PlaylistItemsParams): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const playlist = await this.innertube!.getPlaylist(playlistId);
      
      const videos = playlist.items.slice(0, maxResults).map((item: any, index: number) => ({
        position: index + 1,
        videoId: item.id,
        title: item.title.text,
        author: item.author.name,
        channelId: item.author.id,
        duration: item.duration?.seconds,
        thumbnails: item.thumbnails
      }));
      
      return {
        playlistId,
        totalResults: videos.length,
        videos
      };
    } catch (error) {
      throw new Error(`Failed to get playlist items: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get timestamped transcript
   */
  async getTimestampedTranscript({ videoId, language = 'en' }: TranscriptParams): Promise<any> {
    try {
      const { transcript } = await this.getTranscript({ videoId, language });
      
      const timestampedTranscript = transcript.map((item: any) => {
        const seconds = item.offset / 1000;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        return {
          timestamp: formattedTime,
          text: item.text,
          startTimeMs: parseInt(item.offset || '0'),
          durationMs: parseInt(item.duration || '0')
        };
      });
      
      return {
        videoId,
        language,
        timestampedTranscript
      };
    } catch (error) {
      throw new Error(`Failed to get timestamped transcript: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos({ regionCode = 'US', maxResults = 20 }: { regionCode?: string, maxResults?: number } = {}): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const trending = await this.innertube!.getTrending();
      
      const videos = trending.videos.slice(0, maxResults).map((video: any) => ({
        videoId: video.id,
        title: video.title.text,
        description: video.snippets?.[0]?.text || '',
        author: video.author.name,
        channelId: video.author.id,
        duration: video.duration?.seconds,
        viewCount: video.view_count?.text,
        publishedAt: video.published?.text,
        thumbnails: video.thumbnails
      }));
      
      return {
        regionCode,
        totalResults: videos.length,
        videos
      };
    } catch (error) {
      throw new Error(`Failed to get trending videos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get related videos
   */
  async getRelatedVideos({ videoId, maxResults = 20 }: { videoId: string, maxResults?: number }): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const info = await this.innertube!.getInfo(videoId);
      // Try multiple possible locations for related videos
      let related: any[] = [];
      
      if ((info as any).related_videos) {
        related = (info as any).related_videos.slice(0, maxResults);
      } else if ((info as any).watch_next_feed) {
        related = (info as any).watch_next_feed.slice(0, maxResults);
      } else if ((info as any).secondary_info?.results) {
        related = (info as any).secondary_info.results.slice(0, maxResults);
      }
      
      const videos = related.map((video: any) => ({
        videoId: video.id || '',
        title: video.title?.text || video.title || '',
        author: video.author?.name || '',
        channelId: video.author?.id || '',
        duration: video.duration?.seconds || 0,
        viewCount: video.view_count?.text || '0',
        publishedAt: video.published?.text || '',
        thumbnails: video.thumbnails || []
      }));
      
      return {
        videoId,
        totalResults: videos.length,
        videos
      };
    } catch (error) {
      throw new Error(`Failed to get related videos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}