// src/pages/admin/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import DashboardLayout from '../../component/template/DashboardLayout'

export const Route = createFileRoute('/dashboard/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Dashboard Admin</h1>
        <p>Selamat datang di halaman admin.</p>
      </div>
    </DashboardLayout>
  )
}
