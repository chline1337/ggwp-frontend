import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as UsersIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useRole } from '../../hooks/useRole';
import UserManagement from './UserManagement';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const { user, roleDisplayName, roleColor } = useRole();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const adminFeatures = [
    {
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      comingSoon: true
    },
    {
      title: 'Security Center',
      description: 'Monitor security, manage access controls',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
      comingSoon: true
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and usage statistics',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      comingSoon: true
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AdminIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Chip 
            label={roleDisplayName}
            sx={{ 
              backgroundColor: roleColor,
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.username || user?.email}! Manage your platform from here.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<UsersIcon />} 
            label="User Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Settings" 
            iconPosition="start"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Security" 
            iconPosition="start"
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Analytics" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Overview Tab */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Platform Overview
          </Typography>
          
          {/* Development Notice */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Admin Interface Under Development
            </Typography>
            <Typography variant="body2">
              The admin interface is currently being developed. User Management is now available, 
              and additional features will be added progressively to provide comprehensive platform management capabilities.
            </Typography>
          </Alert>

          {/* Admin Features Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {adminFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1, 
                          borderRadius: 2, 
                          backgroundColor: feature.color + '20',
                          color: feature.color,
                          mr: 2
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button 
                      size="small" 
                      disabled={feature.comingSoon}
                      sx={{ ml: 'auto' }}
                    >
                      {feature.comingSoon ? 'Coming Soon' : 'Configure'}
                    </Button>
                  </CardActions>
                  {feature.comingSoon && (
                    <Chip 
                      label="Coming Soon" 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText'
                      }} 
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Statistics */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Teams
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tournaments
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              * Statistics will be populated when admin API endpoints are implemented
            </Typography>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* User Management Tab */}
        <UserManagement />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Settings Tab */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            System Settings
          </Typography>
          <Alert severity="info">
            <Typography variant="body1">
              System settings management is coming soon. This will include platform configuration, 
              feature toggles, and general system preferences.
            </Typography>
          </Alert>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Security Tab */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Security Center
          </Typography>
          <Alert severity="info">
            <Typography variant="body1">
              Security management features are coming soon. This will include access logs, 
              security policies, and threat monitoring.
            </Typography>
          </Alert>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* Analytics Tab */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Platform Analytics
          </Typography>
          <Alert severity="info">
            <Typography variant="body1">
              Analytics dashboard is coming soon. This will include user engagement metrics, 
              platform usage statistics, and performance insights.
            </Typography>
          </Alert>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard; 