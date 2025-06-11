import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';
import { AdminOnly } from './common/RoleBasedComponent';
import { apiService } from '../services/api';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  Alert,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as TeamIcon,
  EmojiEvents as TournamentIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  TrendingUp as StatsIcon,
  Notifications as NotificationIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Sports as SportsIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { roleDisplayName, roleColor } = useRole();
  const [stats, setStats] = useState({
    teams: 0,
    tournaments: 3,
    events: 5,
    matches: 12
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setDataLoading(true);
      try {
        const [statsResult, activityResult] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getRecentActivity()
        ]);

        if (statsResult.success) {
          setStats(statsResult.data);
        }

        if (activityResult.success) {
          setRecentActivity(activityResult.data);
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        // Keep default values
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadDashboardData();
    }
  }, [loading, user]);

  const quickActions = [
    {
      title: 'Create Team',
      description: 'Start your own esports team',
      icon: <TeamIcon />,
      action: () => navigate('/team-create'),
      color: 'primary'
    },
    {
      title: 'Join Tournament',
      description: 'Compete in upcoming tournaments',
      icon: <TournamentIcon />,
      action: () => navigate('/tournaments'),
      color: 'secondary'
    },
    {
      title: 'Browse Events',
      description: 'Discover gaming events near you',
      icon: <EventIcon />,
      action: () => navigate('/events'),
      color: 'success'
    },
    {
      title: 'View Teams',
      description: 'Explore existing teams',
      icon: <SportsIcon />,
      action: () => navigate('/teams'),
      color: 'info'
    }
  ];

  // Admin-specific quick actions
  const adminQuickActions = [
    {
      title: 'Admin Panel',
      description: 'Manage platform settings and users',
      icon: <AdminIcon />,
      action: () => navigate('/admin'),
      color: 'error'
    },
    {
      title: 'Security Center',
      description: 'Monitor platform security',
      icon: <SecurityIcon />,
      action: () => navigate('/admin'),
      color: 'warning'
    }
  ];

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, action, color }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={action}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" color={color} endIcon={<PlayIcon />}>
          Get Started
        </Button>
      </CardActions>
    </Card>
  );

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'upcoming': return 'warning';
        case 'completed': return 'success';
        case 'registered': return 'info';
        default: return 'default';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'tournament': return <TournamentIcon />;
        case 'team': return <TeamIcon />;
        case 'event': return <EventIcon />;
        default: return <SportsIcon />;
      }
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {getTypeIcon(activity.type)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">{activity.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(activity.date).toLocaleDateString()}
          </Typography>
        </Box>
        <Chip 
          label={activity.status} 
          color={getStatusColor(activity.status)} 
          size="small" 
        />
      </Box>
    );
  };

  if (loading || dataLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Welcome back, {user?.email?.split('@')[0] || 'Player'}!
          </Typography>
          <Chip 
            label={roleDisplayName}
            sx={{ 
              backgroundColor: roleColor,
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <AdminOnly>
            <Chip 
              icon={<AdminIcon />}
              label="Admin Access"
              color="error"
              sx={{ fontWeight: 'bold' }}
            />
          </AdminOnly>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Ready to dominate the esports arena? Here's your command center.
        </Typography>
        
        <AdminOnly>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Admin User Detected:</strong> You have administrative privileges. 
              Access the <Button 
                variant="text" 
                size="small" 
                onClick={() => navigate('/admin')}
                sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}
              >
                Admin Panel
              </Button> for platform management.
            </Typography>
          </Alert>
        </AdminOnly>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="My Teams" 
            value={stats.teams} 
            icon={<TeamIcon />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Tournaments" 
            value={stats.tournaments} 
            icon={<TournamentIcon />} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Upcoming Events" 
            value={stats.events} 
            icon={<EventIcon />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Matches" 
            value={stats.matches} 
            icon={<StatsIcon />} 
            color="info" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Jump right into the action with these quick shortcuts
            </Typography>
            
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <QuickActionCard {...action} />
                </Grid>
              ))}
              
              {/* Admin Quick Actions */}
              <AdminOnly>
                {adminQuickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={`admin-${index}`}>
                    <QuickActionCard {...action} />
                  </Grid>
                ))}
              </AdminOnly>
            </Grid>
          </Paper>

          {/* Profile Quick Access */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Profile & Settings
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{user?.email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Esports Competitor • Member since {new Date().getFullYear()}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Active Player" color="success" />
              <Chip label="Team Member" color="primary" />
              <Chip label="Tournament Participant" color="secondary" />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity & Notifications */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <IconButton size="small">
                <NotificationIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </Box>
            
            <Button 
              fullWidth 
              variant="text" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/profile')}
            >
              View All Activity
            </Button>
          </Paper>

          {/* Tournament Progress */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Tournament Progress
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Spring Championship</Typography>
                <Typography variant="body2" color="text.secondary">3/8 matches</Typography>
              </Box>
              <LinearProgress variant="determinate" value={37.5} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Regional Qualifiers</Typography>
                <Typography variant="body2" color="text.secondary">1/4 matches</Typography>
              </Box>
              <LinearProgress variant="determinate" value={25} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<TournamentIcon />}
              onClick={() => navigate('/tournaments')}
            >
              View All Tournaments
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Paper sx={{ p: 4, mt: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to Level Up?
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Join a tournament, create a team, or discover new gaming events
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            startIcon={<AddIcon />}
            onClick={() => navigate('/tournament-create')}
          >
            Create Tournament
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/create-event')}
          >
            Create Event
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard; 