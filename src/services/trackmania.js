import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for when backend is not available
const mockMaps = [
  {
    uid: 'stadium_a1',
    name: 'Stadium A1',
    author: 'Nadeo',
    environment: 'Stadium',
    record_count: 145
  },
  {
    uid: 'stadium_b3',
    name: 'Stadium B3',
    author: 'Nadeo',
    environment: 'Stadium',
    record_count: 98
  },
  {
    uid: 'canyon_c2',
    name: 'Canyon C2',
    author: 'Hylis',
    environment: 'Canyon',
    record_count: 76
  },
  {
    uid: 'valley_d1',
    name: 'Valley D1',
    author: 'Community',
    environment: 'Valley',
    record_count: 134
  }
];

const mockLeaderboardData = {
  'stadium_a1': {
    map_uid: 'stadium_a1',
    map_name: 'Stadium A1',
    map_author: 'Nadeo',
    map_environment: 'Stadium',
    records: [
      {
        position: 1,
        player_login: 'speedking',
        player_nickname: 'SpeedKing',
        time: 45320,
        time_formatted: '45.320',
        score: 1000,
        checkpoints: [15000, 30000, 45320],
        timestamp: '2024-01-15T10:30:00Z',
        is_personal_best: true,
        improvement_ms: 150
      },
      {
        position: 2,
        player_login: 'racing_pro',
        player_nickname: 'RacingPro',
        time: 45890,
        time_formatted: '45.890',
        score: 995,
        checkpoints: [15200, 30100, 45890],
        timestamp: '2024-01-15T09:45:00Z',
        is_personal_best: true,
        improvement_ms: null
      },
      {
        position: 3,
        player_login: 'fast_driver',
        player_nickname: 'FastDriver',
        time: 46120,
        time_formatted: '46.120',
        score: 990,
        checkpoints: [15100, 30500, 46120],
        timestamp: '2024-01-15T11:15:00Z',
        is_personal_best: false,
        improvement_ms: null
      },
      {
        position: 4,
        player_login: 'track_master',
        player_nickname: 'TrackMaster',
        time: 46450,
        time_formatted: '46.450',
        score: 985,
        checkpoints: [15300, 30200, 46450],
        timestamp: '2024-01-15T08:20:00Z',
        is_personal_best: true,
        improvement_ms: 200
      },
      {
        position: 5,
        player_login: 'drift_king',
        player_nickname: 'DriftKing',
        time: 46780,
        time_formatted: '46.780',
        score: 980,
        checkpoints: [15450, 30800, 46780],
        timestamp: '2024-01-14T16:30:00Z',
        is_personal_best: true,
        improvement_ms: null
      }
    ],
    total_records: 145,
    statistics: {
      fastest_time: 45320,
      fastest_time_formatted: '45.320',
      average_time: 52000,
      average_time_formatted: '52.000',
      unique_players: 89,
      total_records: 145
    }
  },
  'stadium_b3': {
    map_uid: 'stadium_b3',
    map_name: 'Stadium B3',
    map_author: 'Nadeo',
    map_environment: 'Stadium',
    records: [
      {
        position: 1,
        player_login: 'turbo_racer',
        player_nickname: 'TurboRacer',
        time: 52150,
        time_formatted: '52.150',
        score: 1000,
        checkpoints: [18000, 35000, 52150],
        timestamp: '2024-01-15T12:00:00Z',
        is_personal_best: true,
        improvement_ms: 320
      },
      {
        position: 2,
        player_login: 'speed_demon',
        player_nickname: 'SpeedDemon',
        time: 52890,
        time_formatted: '52.890',
        score: 995,
        checkpoints: [18200, 35300, 52890],
        timestamp: '2024-01-15T10:15:00Z',
        is_personal_best: true,
        improvement_ms: null
      }
    ],
    total_records: 98,
    statistics: {
      fastest_time: 52150,
      fastest_time_formatted: '52.150',
      average_time: 58000,
      average_time_formatted: '58.000',
      unique_players: 65,
      total_records: 98
    }
  }
};

const mockServerStatus = {
  success: true,
  status: 'online',
  name: 'GGWP Trackmania Server',
  current_players: 12,
  max_players: 32,
  current_map: {
    uid: 'stadium_a1',
    name: 'Stadium A1',
    author: 'Nadeo'
  },
  game_mode: 'TimeAttack',
  last_sync: new Date().toISOString(),
  uptime: 86400, // 24 hours in seconds
  connection_quality: {
    quality: 'excellent',
    response_time_ms: 25,
    packet_loss_percent: 0.1,
    stability: 'stable'
  }
};

export const trackmaniaService = {
  // Get available maps
  getMaps: async () => {
    try {
      const response = await api.get('/api/trackmania/maps');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Trackmania backend not available, using mock data');
      return {
        success: true,
        data: mockMaps,
        fromMock: true
      };
    }
  },

  // Get leaderboard for a specific map
  getLeaderboard: async (mapUid, page = 1, perPage = 25) => {
    try {
      const response = await api.get(`/api/trackmania/leaderboards/${mapUid}`, {
        params: { page, per_page: perPage }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Trackmania backend not available, using mock data');
      const mockData = mockLeaderboardData[mapUid];
      if (mockData) {
        return {
          success: true,
          data: {
            ...mockData,
            pagination: {
              page: page,
              per_page: perPage,
              total_items: mockData.total_records,
              total_pages: Math.ceil(mockData.total_records / perPage),
              has_previous: page > 1,
              has_next: page < Math.ceil(mockData.total_records / perPage)
            },
            performance: {
              response_time_ms: 15,
              database_queries: 2,
              cache_hits: 1,
              cache_misses: 0,
              data_source: 'mock',
              last_updated: new Date().toISOString()
            }
          },
          fromMock: true
        };
      } else {
        return {
          success: false,
          error: 'Map not found',
          data: null
        };
      }
    }
  },

  // Get enhanced leaderboard with full features
  getEnhancedLeaderboard: async (mapUid, options = {}) => {
    const {
      page = 1,
      perPage = 25,
      sortField = 'time',
      sortDirection = 'asc',
      playerLogin = null,
      useCache = true
    } = options;

    try {
      const response = await api.get(`/api/trackmania/enhanced/leaderboards/${mapUid}`, {
        params: {
          page,
          per_page: perPage,
          sort_field: sortField,
          sort_direction: sortDirection,
          player_login: playerLogin,
          use_cache: useCache
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Enhanced Trackmania backend not available, using mock data');
      const mockData = mockLeaderboardData[mapUid];
      if (mockData) {
        return {
          success: true,
          data: {
            success: true,
            message: `Leaderboard for ${mockData.map_name} (Mock Data)`,
            performance: {
              response_time_ms: 12,
              database_queries: 3,
              cache_hits: 2,
              cache_misses: 1,
              data_source: 'mock',
              last_updated: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
            ...mockData,
            pagination: {
              page: page,
              per_page: perPage,
              total_items: mockData.total_records,
              total_pages: Math.ceil(mockData.total_records / perPage),
              has_previous: page > 1,
              has_next: page < Math.ceil(mockData.total_records / perPage)
            },
            filters_applied: playerLogin ? { player_login: playerLogin } : null,
            sort_options: {
              field: sortField,
              direction: sortDirection
            }
          },
          fromMock: true
        };
      } else {
        return {
          success: false,
          error: 'Map not found',
          data: null
        };
      }
    }
  },

  // Get server status
  getServerStatus: async () => {
    try {
      const response = await api.get('/api/trackmania/server/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Trackmania server status not available, using mock data');
      return {
        success: true,
        data: mockServerStatus,
        fromMock: true
      };
    }
  },

  // Get enhanced server status
  getEnhancedServerStatus: async (includePlayerList = false, includeConnectionMetrics = true) => {
    try {
      const response = await api.get('/api/trackmania/enhanced/server/status', {
        params: {
          include_players: includePlayerList,
          include_connection_metrics: includeConnectionMetrics
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Enhanced server status not available, using mock data');
      return {
        success: true,
        data: {
          success: true,
          message: 'Server status retrieved successfully (Mock Data)',
          performance: {
            response_time_ms: 8,
            database_queries: 1,
            cache_hits: 1,
            cache_misses: 0,
            data_source: 'mock',
            last_updated: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          server_id: 'ggwp_server_1',
          ...mockServerStatus,
          server_info: {
            version: 'TM2020',
            build: '2024.01.15',
            ladder_enabled: true,
            password_protected: false,
            max_spectators: 32
          },
          player_list: includePlayerList ? [
            { login: 'speedking', nickname: 'SpeedKing', nation: 'Germany' },
            { login: 'racing_pro', nickname: 'RacingPro', nation: 'France' },
            { login: 'fast_driver', nickname: 'FastDriver', nation: 'Spain' }
          ] : null
        },
        fromMock: true
      };
    }
  },

  // Get all leaderboards (overview)
  getAllLeaderboards: async () => {
    try {
      const response = await api.get('/api/trackmania/leaderboards');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Trackmania leaderboards not available, using mock data');
      return {
        success: true,
        data: Object.values(mockLeaderboardData).map(leaderboard => ({
          map_uid: leaderboard.map_uid,
          map_name: leaderboard.map_name,
          map_author: leaderboard.map_author,
          map_environment: leaderboard.map_environment,
          total_records: leaderboard.total_records,
          fastest_time: leaderboard.statistics.fastest_time,
          fastest_time_formatted: leaderboard.statistics.fastest_time_formatted,
          top_player: leaderboard.records[0]?.player_nickname || 'Unknown'
        })),
        fromMock: true
      };
    }
  },

  // Format time from milliseconds to readable format
  formatTime: (milliseconds) => {
    if (milliseconds <= 0) return '0.000';
    
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
    } else {
      return seconds.toFixed(3);
    }
  },

  // Get nation flag emoji
  getNationFlag: (nation) => {
    const flags = {
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'United Kingdom': '🇬🇧',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Poland': '🇵🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Belgium': '🇧🇪'
    };
    return flags[nation] || '🏁';
  }
}; 