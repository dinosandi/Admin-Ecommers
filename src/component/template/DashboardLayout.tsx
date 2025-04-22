import * as React from 'react'
import Box from '@mui/material/Box'
import { createTheme } from '@mui/material/styles'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import { AppProvider } from '@toolpad/core/AppProvider'
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout'
import { useLocation } from '@tanstack/react-router'

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
})

function DemoPageContent({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        py: 4,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 2,
      }}
    >
      {children}
    </Box>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <AppProvider
      navigation={[
        {
          segment: 'dashboard',
          title: 'Dashboard',
          icon: <FolderIcon />,
          children: [
            {
              segment: 'overview',
              title: 'Overview',
              icon: <DescriptionIcon />,
            },
            {
              segment: 'transaksi',
              title: 'Transaksi',
              icon: <DescriptionIcon />,
            },
          ],
        },
      ]}
      router={{
        pathname: location.pathname,
        searchParams: new URLSearchParams(location.search),
        navigate: (path) => location.navigate(path),
      }}
      theme={demoTheme}
    >
      <ToolpadDashboardLayout>
        <DemoPageContent>{children}</DemoPageContent>
      </ToolpadDashboardLayout>
    </AppProvider>
  )
}
