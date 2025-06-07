import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/store/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data-barang/"!</div>
}
