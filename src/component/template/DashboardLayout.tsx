import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box, Drawer, CssBaseline, Toolbar, Divider, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps, Collapse, Avatar, Typography, Menu, MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Home as HomeIcon,
  Person as PersonIcon, Assignment as AssignmentIcon, History as HistoryIcon,
  ExpandLess, ExpandMore, Group as GroupIcon, Store as StoreIcon, Logout as LogoutIcon,
  // Mail as MailIcon // Dihapus: MailIcon tidak diperlukan lagi
} from '@mui/icons-material';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';

// Import gambar dari folder assets
import LinearMSFPLogo from '../../assets/admin.png'; // Sesuaikan path dan nama file
import UTMobileAppsLogo from '../../assets/logo1.png'; // Sesuaikan path dan nama file

// Kunci localStorage untuk user data
const USER_DATA_LOCAL_STORAGE_KEY = 'user';
const SENDER_ID_LOCAL_STORAGE_KEY = 'chatSenderId';

// Define Customer type
type Customer = {
  Id: string;
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  ImageUrl: string;
  ImageFile: string | null;
  LicenseNumber: string | null;
  VehicleInfo: string | null;
  Role: number;
  DriverId: string | null;
};

// Hook untuk mengambil semua customer
export const useGetCustomers = () => {
  return useQuery<Customer[]>({
    queryKey: ["allCustomers"],
    queryFn: async () => {
      const res = await api.get(`/Customer/profile`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

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
  minHeight: '64px',
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
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
  const [loggedInUserId, setLoggedInUserId] = React.useState<string | null>(null);
  const [loggedInCustomerProfile, setLoggedInCustomerProfile] = React.useState<Customer | null>(null);

  const openMenu = Boolean(anchorEl);

  const { data: allCustomers } = useGetCustomers();

  React.useEffect(() => {
    const userString = localStorage.getItem(USER_DATA_LOCAL_STORAGE_KEY);
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const storedUserId = user.userId || user.username;
        setLoggedInUserId(storedUserId);

        if (storedUserId && allCustomers) {
          const foundCustomer = allCustomers.find(
            (customer) => customer.UserId === storedUserId
          );
          setLoggedInCustomerProfile(foundCustomer || null);
          if (foundCustomer && foundCustomer.Role === 0) {
            localStorage.setItem(SENDER_ID_LOCAL_STORAGE_KEY, foundCustomer.Id);
          } else {
            localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        setLoggedInUserId(null);
        setLoggedInCustomerProfile(null);
        localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
      }
    } else {
      setLoggedInUserId(null);
      setLoggedInCustomerProfile(null);
      localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
    }
  }, [allCustomers]);

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
    setLoggedInUserId(null);
    setLoggedInCustomerProfile(null);
    navigate({ to: '/' });
    alert('Logout successful!');
  };


  const menuItems = [
    { text: 'Dashboard', icon: <AssignmentIcon />, path: '/dashboard/' },
    {
      text: 'Master User',
      icon: <PersonIcon />,
      children: [
        { text: 'Transactions', icon: <GroupIcon />, path: '/dashboard/master-user/Transactions' },
        { text: 'Data Product', icon: <StoreIcon />, path: '/dashboard/master-user/product' },
      ],
    },
    { text: 'Data Store', icon: <HomeIcon />, path: '/dashboard/store' },
    { text: 'Chat', icon: <HistoryIcon />, path: '/dashboard/chat' },
  ];

  const displayUsername = loggedInCustomerProfile?.FullName || loggedInUserId || 'Guest';
  const displayEmail = loggedInCustomerProfile?.Email || 'unknown@email.com';
  const displayAvatarSrc = loggedInCustomerProfile?.ImageUrl || undefined;
  const initial = displayUsername.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ bgcolor: 'white', color: 'black', borderBottom: '1px solid #e0e0e0' }}>
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
          {/* Logo di Kiri Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img
              src={UTMobileAppsLogo} // Ganti dengan logo yang tepat
              alt="UT Mobile Apps"
              style={{ height: '85px', marginRight: theme.spacing(1) }} // Sesuaikan tinggi
            />
          </Box>
         
          <Box sx={{ flexGrow: 1 }} /> {/* Ini akan mendorong item ke kanan */}

          {/* Ikon Notifikasi Pesan (MailIcon) - Dihapus sepenuhnya */}
          {/* <IconButton color="inherit" onClick={handleChatNotificationsClick} sx={{ mr: 2 }}>
            <MailIcon />
          </IconButton> */}

          {/* Avatar dan Menu Pengguna */}
          {loggedInUserId && (
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 2 }}>
                <Avatar src={displayAvatarSrc} alt={displayUsername}>
                  {!displayAvatarSrc && initial}
                </Avatar>
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
                    {displayUsername}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2">{displayEmail}</Typography>
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
            bgcolor: '#FFFFFF', 
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader sx={{ bgcolor: '#FFD500' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, height: '100%' }}>
            <img
              src={LinearMSFPLogo} // Ganti dengan logo linear-msfp
              alt="LINEAR MSFP"
              style={{ height: '85px', marginRight: theme.spacing(1) }} // Sesuaikan tinggi
            />
            <Typography variant="h6" noWrap component="div" sx={{ color: 'black', fontWeight: 'bold' }}>
              ADMIN
            </Typography>
          </Box>
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
                      : () => navigate({ to: path! })
                  }
                  sx={{
                    '&:hover': {
                      backgroundColor: '#FFD500', // Warna hover
                      '& .MuiListItemIcon-root': {
                        color: 'black', // Warna ikon saat hover
                      },
                      '& .MuiListItemText-primary': {
                        color: 'black', // Warna teks saat hover
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'black' }}>{icon}</ListItemIcon>
                  <ListItemText primary={text} sx={{ color: 'black' }} />
                  {children && (openSubMenu ? <ExpandLess sx={{ color: 'black' }} /> : <ExpandMore sx={{ color: 'black' }} />)}
                </ListItemButton>
              </ListItem>
              {children && (
                <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {children.map(({ text: childText, path: childPath, icon: childIcon }) => (
                      <ListItem key={childText} disablePadding>
                        <ListItemButton
                          onClick={() => navigate({ to: childPath })}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#FFD500',
                              '& .MuiListItemIcon-root': {
                                color: 'black',
                              },
                              '& .MuiListItemText-primary': {
                                color: 'black',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: 'black' }}>{childIcon}</ListItemIcon>
                          <ListItemText primary={childText} sx={{ color: 'black' }} />
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