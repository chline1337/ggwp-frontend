import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  Avatar,
  TablePagination,
  CircularProgress,
  Alert,
  Skeleton,
  Tooltip,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  EmojiEvents,
  Speed,
  Person,
  Schedule,
  Refresh,
  TrendingUp
} from '@mui/icons-material';
import TimeDisplay from './TimeDisplay';
import { trackmaniaService } from '../../services/trackmania';

const LeaderboardTable = ({ 
  mapUid, 
  mapName = 'Unknown Map',
  showPagination = true,
  showStatistics = true,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFromMock, setIsFromMock] = useState(false);

  // Load leaderboard data
  const loadLeaderboard = async (pageNum = 0, perPage = 25) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await trackmaniaService.getEnhancedLeaderboard(mapUid, {
        page: pageNum + 1, // API expects 1-based pagination
        perPage: perPage
      });

      if (result.success) {
        setLeaderboardData(result.data);
        setIsFromMock(result.fromMock || false);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and setup auto-refresh
  React.useEffect(() => {
    if (mapUid) {
      loadLeaderboard(page, rowsPerPage);
    }
  }, [mapUid, page, rowsPerPage]);

  // Auto-refresh setup
  React.useEffect(() => {
    if (autoRefresh && mapUid) {
      const interval = setInterval(() => {
        loadLeaderboard(page, rowsPerPage);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, mapUid, page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manual refresh
  const handleRefresh = () => {
    loadLeaderboard(page, rowsPerPage);
  };

  // Get position styling
  const getPositionStyling = (position) => {
    switch (position) {
      case 1:
        return { color: '#FFD700', fontWeight: 700 }; // Gold
      case 2:
        return { color: '#C0C0C0', fontWeight: 600 }; // Silver
      case 3:
        return { color: '#CD7F32', fontWeight: 600 }; // Bronze
      default:
        return { fontWeight: 500 };
    }
  };

  // Get position icon
  const getPositionIcon = (position) => {
    if (position <= 3) {
      return <EmojiEvents sx={{ fontSize: '1.2rem', ...getPositionStyling(position) }} />;
    }
    return null;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Loading skeleton
  if (loading && !leaderboardData) {
    return (
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Position', 'Player', 'Time', 'Score', 'Date'].map((header) => (
                    <TableCell key={header}>
                      <Skeleton variant="text" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(10)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(5)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  // No data state
  if (!leaderboardData || !leaderboardData.records || leaderboardData.records.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Speed sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Records Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Be the first to set a record on this map!
        </Typography>
      </Paper>
    );
  }

  const { records, pagination, statistics, performance } = leaderboardData;

  return (
    <Box>
      {/* Header with statistics */}
      {showStatistics && statistics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="primary" />
                {mapName} Leaderboard
                {isFromMock && (
                  <Chip label="Demo Data" size="small" color="warning" />
                )}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {lastUpdated && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </Typography>
                )}
                <Tooltip title="Refresh leaderboard">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Statistics grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight={600}>
                  {statistics.total_records}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Records
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <TimeDisplay 
                  timeFormatted={statistics.fastest_time_formatted}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  Fastest Time
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main" fontWeight={600}>
                  {statistics.unique_players}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Players
                </Typography>
              </Box>

              {performance && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight={600}>
                    {performance.response_time_ms}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response Time
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow 
                  key={`${record.player_login}-${record.timestamp}`}
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    ...(record.position <= 3 && { backgroundColor: 'action.selected' })
                  }}
                >
                  {/* Position */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPositionIcon(record.position)}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          ...getPositionStyling(record.position),
                          minWidth: '2rem'
                        }}
                      >
                        #{record.position}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Player */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {record.player_nickname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.player_login}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Time */}
                  <TableCell>
                    <TimeDisplay
                      time={record.time}
                      timeFormatted={record.time_formatted}
                      showImprovement={!!record.improvement_ms}
                      improvementMs={record.improvement_ms}
                      isPersonalBest={record.is_personal_best}
                      size="medium"
                    />
                  </TableCell>

                  {/* Score */}
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {record.score.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatTimestamp(record.timestamp)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {showPagination && pagination && (
          <TablePagination
            component="div"
            count={pagination.total_items}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Records per page:"
          />
        )}
      </Paper>

      {/* Loading overlay for refresh */}
      {loading && leaderboardData && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default LeaderboardTable; 