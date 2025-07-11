import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const TimeDisplay = ({ 
  time, 
  timeFormatted, 
  showImprovement = false, 
  improvementMs = null,
  size = 'medium',
  isPersonalBest = false 
}) => {
  // Function to format improvement time
  const formatImprovement = (ms) => {
    if (!ms) return null;
    const seconds = Math.abs(ms) / 1000;
    return seconds.toFixed(3);
  };

  // Determine time display size
  const getFontSize = () => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'large': return '1.5rem';
      case 'xlarge': return '2rem';
      default: return '1rem';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'monospace',
          fontSize: getFontSize(),
          fontWeight: size === 'large' || size === 'xlarge' ? 600 : 500,
          color: isPersonalBest ? 'primary.main' : 'text.primary'
        }}
      >
        {timeFormatted || '0.000'}
      </Typography>

      {isPersonalBest && (
        <Chip
          label="PB"
          size="small"
          color="primary"
          sx={{
            height: 20,
            fontSize: '0.6rem',
            fontWeight: 600
          }}
        />
      )}

      {showImprovement && improvementMs && (
        <Chip
          icon={improvementMs < 0 ? <TrendingUp /> : <TrendingDown />}
          label={`${improvementMs < 0 ? '-' : '+'}${formatImprovement(improvementMs)}s`}
          size="small"
          color={improvementMs < 0 ? 'success' : 'warning'}
          sx={{
            height: 20,
            fontSize: '0.6rem',
            fontWeight: 600,
            '& .MuiChip-icon': {
              fontSize: '0.8rem'
            }
          }}
        />
      )}
    </Box>
  );
};

export default TimeDisplay; 