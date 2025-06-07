import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box, Drawer, CssBaseline, Toolbar, Divider, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps, Collapse, Avatar, Typography, Menu, MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Home as HomeIcon,
  Person as PersonIcon, Assignment as AssignmentIcon, History as HistoryIcon,
  ExpandLess, ExpandMore, Group as GroupIcon, Store as StoreIcon, Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from '@tanstack/react-router';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openSubMenu, setOpenSubMenu] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userData, setUserData] = React.useState<{ username: string; email: string } | null>(null);
  const openMenu = Boolean(anchorEl);

  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserData(null);
      }
    }
  }, []);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    navigate({ to: '/' });
    alert('Logout successful!');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <AssignmentIcon />, path: '/dashboard/master-data' },
    {
      text: 'Master User',
      icon: <PersonIcon />,
      children: [
        { text: 'Data Customer', icon: <GroupIcon />, path: '/dashboard/master-user/customers' },
        { text: 'Data Product', icon: <StoreIcon />, path: '/dashboard/master-user/product' },
      ],
    },
    { text: 'Data Store', icon: <HomeIcon />, path: '/dashboard/store' },
  ];

  const username = userData?.username || 'Dino Sandi';
  const email = userData?.email || 'unknown@email.com';
  const initial = username.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ bgcolor: 'white', color: 'black' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {userData && (
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 2 }}>
                <Avatar>{initial}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" fontWeight="bold">
                    {username}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2">{email}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <HistoryIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map(({ text, icon, path, children }) => (
            <React.Fragment key={text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={
                    children
                      ? () => setOpenSubMenu((prev) => !prev)
                      : () => (window.location.href = path!)
                  }
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                  {children && (openSubMenu ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              {children && (
                <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {children.map(({ text: childText, path: childPath, icon: childIcon }) => (
                      <ListItem key={childText} disablePadding>
                        <ListItemButton onClick={() => (window.location.href = childPath)}>
                          <ListItemIcon>{childIcon}</ListItemIcon>
                          <ListItemText primary={childText} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
