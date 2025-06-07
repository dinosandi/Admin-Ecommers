import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

// Types
interface Product {
  Id: string
  Name: string
  Description: string
  Price: number
  Stock: number
  ImageUrl: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string | null
  ProductCategories: any[]
  ProductDiscounts: any[]
  TransactionDetails: any
  Reviews: any
}

// Mock API function - replace with your actual API call
const fetchProducts = async (): Promise<Product[]> => {
  // Replace this with your actual API endpoint
  const response = await fetch('/api/products')
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  return response.json()
}

export const Route = createFileRoute('/dashboard/master-user/product/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  
  // Using useQuery to fetch products data
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    // You can add more options here like refetchInterval, etc.
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading products: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Master Product</h1>
        <p className="text-gray-600">Kelola data produk Anda</p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            to="/dashboard/master-user/product"
            className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            activeProps={{
              className: "py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            }}
            inactiveProps={{
              className: "py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            }}
          >
            List Produk
          </Link>
          <Link
            to="/dashboard/master-user/product/create"
            className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            activeProps={{
              className: "py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            }}
          >
            Create Product
          </Link>
          <Link
            to="/dashboard/master-user/product/discount"
            className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            activeProps={{
              className: "py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            }}
          >
            Diskon
          </Link>
        </nav>
      </div>

      {/* Content Area */}
      <Outlet />

      {/* Table Section - Only show on main route */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Daftar Produk</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                onClick={() => navigate({ to: '/dashboard/master-user/product/create' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Tambah Produk
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada produk yang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gambar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.ImageUrl || '/placeholder-image.jpg'}
                          alt={product.Name}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg'
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.Name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {product.Description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.Price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.Stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.IsActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.IsActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.CreatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}