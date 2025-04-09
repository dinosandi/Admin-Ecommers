import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import {Box} from '@mui/material'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return(
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
            }}
        >
            <Box sx={{
                width: '100%'
            }}>
                <Outlet />
            </Box>
        </Box>
    )
}