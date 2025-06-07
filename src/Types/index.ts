export interface FormCreateLogin {
  email: string;
  password: string;
}

export interface FormCreateProducts {
  name: string;
  price?: number | null;
  stock?: number | null;
  description?: string;
  imageFile?: File | null;
  imageUrl?: string;
}