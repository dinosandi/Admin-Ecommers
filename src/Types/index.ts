import { Product } from './index';
export interface FormCreateLogin {
  email: string;
  password: string;
}
export interface FormCreaCategory {
  Name: string;
}
export interface FormCreateProducts {
  name: string;
  price?: number | null;
  stock?: number | null;
  description?: string;
  imageFile?: File | null;
  imageUrl?: string;
}
export interface FormCreateBundle {
  Name: string;
  Description: string;
  DiscountPercentage: number;
  Image: string;
  StartDate: string;
  EndDate: string;
  Items: {
    ProductId: string;
    Quantity: number;
  }[];
}
export interface FormCreateStore {
  Name: string;
  Provinces: string;
  Cities: string;
  Districts: string;
  Villages: string;
  Latitude: number;
  Longitude: number;
  Email: string;
  PhoneNumber: string;
  OperationalHours: string;
}
export interface TransactionItem {
  Id: string;
  ProductId: string | null;
  BundleId: string | null;
  ItemName: string | null;
  ItemType: string;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
  Subtotal: number;
  ProductName: string;
  BundleName: string;
}

export interface TransactionStatusHistory {
  Id: string;
  TransactionId: string;
  Status: string;
  UpdatedAt: string;
}

export interface Transaction {
  Id: string;
  UserId: string;
  StoreId: string;
  DriverId: string | null;
  InvoiceNumber: string;
  TotalAmount: number;
  Status: string;
  PaymentMethod: string;
  DeliveryMethod: string;
  TrackingNumber: string | null;
  TransactionDate: string;
  RecipientName: string | null;
  RecipientPhone: string | null;
  ShippingAddress: string | null;
  ShippingCity: string | null;
  ShippingPostalCode: string | null;
  Items: TransactionItem[];
  StatusHistories: TransactionStatusHistory[];
}
export interface Driver {
  Id: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  ImageUrl: string;
  ImageFile: string;
  LicenseNumber: string;
  VehicleInfo: string;
  Role: number;
  DriverId: string; 
}
export interface Product {
  Id: string;
  Name: string;
  Description: string;
  Stock: number;
  Price: number;
  IsActive: boolean;
  ImageUrl: string;
  Categories: any;
}

export interface Bundle {
  Id: string;
  Name: string;
  Description: string;
  DiscountPercentage: number;
  Image: string | null;
  TotalOriginalPrice: number;
  TotalDiscountedPrice: number;
  TotalSavings: number;
  StartDate: string;
  EndDate: string;
  Items: any[] | null;
}
export interface Store {
  Id: string;
  Name: string;
  Provinces: string;
  Cities: string;
  Districts: string;
  Villages: string | null;
  Email: string;
  PhoneNumber: string;
  OperationalHours: string;
  Latitude: number;
  Longitude: number;
  Products: any[];
  Bundles: any[];
}
export interface Transaction {
  Id: string;
  UserId: string;
  StoreId: string;
  Store: {
    Name: string;
    Provinces: string;
    Cities: string;
    Districts: string;
    Villages: string | null;
    Latitude: number;
    Longitude: number;
    Email: string;
    PhoneNumber: string;
    OperationalHours: string;
    ProductIds: string[];
    BundleIds: string[];
  };
  Items: TransactionItem[];
  TransactionDate: string; // Misal: "2023-06-28T10:30:00Z" (ISO 8601 string)
  TotalAmount: number; // Total amount for the entire transaction
}
