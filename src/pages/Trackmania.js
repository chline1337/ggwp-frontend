import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Skeleton,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Speed,
  Refresh,
  Settings,
  Timeline,
  LiveTv
} from '@mui/icons-material';
import MapSelector from '../components/trackmania/MapSelector';
import LeaderboardTable from '../components/trackmania/LeaderboardTable';
import { trackmaniaService } from '../services/trackmania';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trackmania-tabpanel-${index}`}
      aria-labelledby={`trackmania-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Trackmania = () => {
  const [selectedMapUid, setSelectedMapUid] = useState('stadium_a1'); // Default map
  const [selectedMapName, setSelectedMapName] = useState('Stadium A1');
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [serverStatus, setServerStatus] = useState(null);
  const [loadingServerStatus, setLoadingServerStatus] = useState(true);
  const [maps, setMaps] = useState([]);

  // Load server status
  const loadServerStatus = async () => {
    try {
      const result = await trackmaniaService.getEnhancedServerStatus(false, true);
      if (result.success) {
        setServerStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load server status:', error);
    } finally {
      setLoadingServerStatus(false);
    }
  };

  // Load maps to get map names
  const loadMaps = async () => {
    try {
      const result = await trackmaniaService.getMaps();
      if (result.success) {
        setMaps(result.data);
        // Update selected map name if we have the map data
        const selectedMap = result.data.find(map => map.uid === selectedMapUid);
        if (selectedMap) {
          setSelectedMapName(selectedMap.name);
        }
      }
    } catch (error) {
      console.error('Failed to load maps:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    loadServerStatus();
    loadMaps();
  }, []);

  // Auto-refresh server status
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadServerStatus, 60000); // 1 minute for server status
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Handle map selection
  const handleMapSelect = (mapUid) => {
    setSelectedMapUid(mapUid);
    // Update map name
    const selectedMap = maps.find(map => map.uid === mapUid);
    if (selectedMap) {
      setSelectedMapName(selectedMap.name);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format server uptime
  const formatUptime = (seconds) => {
    if (!seconds) return 'Unknown';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Speed sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Typography variant="h3" component="h1" fontWeight={700}>
            Trackmania Statistics
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Live leaderboards and racing statistics
        </Typography>

        {/* Server status card */}
        {loadingServerStatus ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton variant="text" height={30} width="40%" />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Skeleton variant="rectangular" height={60} width={120} />
                <Skeleton variant="rectangular" height={60} width={120} />
                <Skeleton variant="rectangular" height={60} width={120} />
              </Box>
            </CardContent>
          </Card>
        ) : serverStatus ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LiveTv color={serverStatus.status === 'online' ? 'success' : 'error'} />
                  Server Status
                  {serverStatus.fromMock && (
                    <Alert severity="info" sx={{ py: 0, px: 1, ml: 2 }}>
                      Demo Mode
                    </Alert>
                  )}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto Refresh"
                  />
                  <Tooltip title="Refresh server status">
                    <IconButton onClick={loadServerStatus}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary.main" fontWeight={600}>
                      {serverStatus.current_players}/{serverStatus.max_players}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Players Online
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight={600}>
                      {serverStatus.status === 'online' ? 'Online' : 'Offline'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Server Status
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h4" color="secondary.main" fontWeight={600}>
                      {serverStatus.game_mode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Game Mode
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.main" fontWeight={600}>
                      {formatUptime(serverStatus.uptime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {serverStatus.current_map && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Map:
                  </Typography>
                  <Typography variant="h6">
                    {serverStatus.current_map.name} by {serverStatus.current_map.author}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="trackmania navigation tabs"
          variant="fullWidth"
        >
          <Tab 
            label="Live Leaderboards" 
            icon={<Timeline />} 
            iconPosition="start"
            id="trackmania-tab-0"
            aria-controls="trackmania-tabpanel-0"
          />
          <Tab 
            label="Coming Soon" 
            icon={<Settings />} 
            iconPosition="start"
            disabled
            id="trackmania-tab-1"
            aria-controls="trackmania-tabpanel-1"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Live Leaderboards Tab */}
        <Box>
          {/* Map Selector */}
          <MapSelector
            selectedMapUid={selectedMapUid}
            onMapSelect={handleMapSelect}
            showEnvironmentFilter={true}
          />

          {/* Leaderboard Table */}
          {selectedMapUid ? (
            <Box sx={{ position: 'relative' }}>
              <LeaderboardTable
                mapUid={selectedMapUid}
                mapName={selectedMapName}
                showPagination={true}
                showStatistics={true}
                autoRefresh={autoRefresh}
                refreshInterval={refreshInterval}
              />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select a Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a map from the selector above to view its leaderboard
              </Typography>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Coming Soon Tab */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Settings sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Player statistics, historical data, and advanced features are coming soon!
          </Typography>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default Trackmania; 