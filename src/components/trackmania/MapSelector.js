import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import {
  Map,
  LocationOn,
  Person,
  Timeline
} from '@mui/icons-material';
import { trackmaniaService } from '../../services/trackmania';

const MapSelector = ({ 
  selectedMapUid, 
  onMapSelect, 
  showMapCards = false,
  showEnvironmentFilter = true 
}) => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [environmentFilter, setEnvironmentFilter] = useState('all');

  // Load available maps
  useEffect(() => {
    const loadMaps = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await trackmaniaService.getMaps();
        
        if (result.success) {
          setMaps(result.data);
        } else {
          setError('Failed to load maps');
        }
      } catch (err) {
        setError('Failed to load maps');
        console.error('Maps loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
  }, []);

  // Get unique environments
  const getEnvironments = () => {
    const environments = [...new Set(maps.map(map => map.environment))];
    return environments.filter(env => env && env.trim() !== '');
  };

  // Filter maps by environment
  const getFilteredMaps = () => {
    if (environmentFilter === 'all') {
      return maps;
    }
    return maps.filter(map => map.environment === environmentFilter);
  };

  // Get environment color
  const getEnvironmentColor = (environment) => {
    const colors = {
      'Stadium': 'primary',
      'Canyon': 'warning', 
      'Valley': 'success',
      'Lagoon': 'info',
      'Desert': 'secondary'
    };
    return colors[environment] || 'default';
  };

  // Get environment icon
  const getEnvironmentIcon = (environment) => {
    return <LocationOn />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CircularProgress size={24} />
        <Typography>Loading maps...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (maps.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No maps available
      </Alert>
    );
  }

  const filteredMaps = getFilteredMaps();
  const environments = getEnvironments();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Map selector dropdown */}
        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
          <InputLabel>Select Map</InputLabel>
          <Select
            value={selectedMapUid || ''}
            onChange={(e) => onMapSelect(e.target.value)}
            label="Select Map"
          >
            <MenuItem value="">
              <em>Choose a map</em>
            </MenuItem>
            {filteredMaps.map((map) => (
              <MenuItem key={map.uid} value={map.uid}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    <Map fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{map.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {map.author} • {map.environment}
                    </Typography>
                  </Box>
                  {map.record_count && (
                    <Chip 
                      label={`${map.record_count} records`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Environment filter */}
        {showEnvironmentFilter && environments.length > 1 && (
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              label="Environment"
            >
              <MenuItem value="all">All Environments</MenuItem>
              {environments.map((env) => (
                <MenuItem key={env} value={env}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getEnvironmentIcon(env)}
                    {env}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Environment filter chips */}
      {showEnvironmentFilter && environments.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setEnvironmentFilter('all')}
            color={environmentFilter === 'all' ? 'primary' : 'default'}
            variant={environmentFilter === 'all' ? 'filled' : 'outlined'}
          />
          {environments.map((env) => (
            <Chip
              key={env}
              label={env}
              onClick={() => setEnvironmentFilter(env)}
              color={environmentFilter === env ? getEnvironmentColor(env) : 'default'}
              variant={environmentFilter === env ? 'filled' : 'outlined'}
              icon={getEnvironmentIcon(env)}
            />
          ))}
        </Box>
      )}

      {/* Map cards view */}
      {showMapCards && (
        <Grid container spacing={2}>
          {filteredMaps.map((map) => (
            <Grid item xs={12} sm={6} md={4} key={map.uid}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedMapUid === map.uid ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => onMapSelect(map.uid)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: getEnvironmentColor(map.environment) + '.main' }}>
                      <Map />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {map.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {map.author}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={map.environment}
                      size="small"
                      color={getEnvironmentColor(map.environment)}
                      icon={getEnvironmentIcon(map.environment)}
                    />
                    
                    {map.record_count && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Timeline fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {map.record_count} records
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selected map info */}
      {selectedMapUid && !showMapCards && (
        <Box sx={{ mt: 2 }}>
          {(() => {
            const selectedMap = maps.find(map => map.uid === selectedMapUid);
            if (!selectedMap) return null;
            
            return (
              <Card variant="outlined">
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: getEnvironmentColor(selectedMap.environment) + '.main' }}>
                      <Map />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{selectedMap.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {selectedMap.author} • {selectedMap.environment}
                        {selectedMap.record_count && ` • ${selectedMap.record_count} records`}
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedMap.environment}
                      color={getEnvironmentColor(selectedMap.environment)}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })()}
        </Box>
      )}
    </Box>
  );
};

export default MapSelector; 