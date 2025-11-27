export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  productName: string;
  quantity: number;
  unit?: string; // Unit of measurement (kg, litre, units, etc.)
  productionLocation: string; // Farmer's farm location
  qrCode: string; // Unique QR code URL
  createdAt: string;
  status: ProductStatus;
  farmerPrice?: number; // Price farmer demands when assigning to seller (charge farmer pays seller)
  sellerPrice?: number; // Price seller will sell the product for
  sellerId?: string;
  sellerName?: string;
  sellerLocation?: string;
  transporterId?: string;
  transporterName?: string;
  transporterCharge?: number;
  journey: JourneyStep[];
}

export type ProductStatus =
  | 'CREATED'
  | 'BOOKED_TRANSPORT'
  | 'IN_TRANSIT'
  | 'AT_SELLER'
  | 'SOLD'
  | 'REJECTED'
  | 'ASSIGNED_TO_SELLER'
  | 'PARTIALLY_SOLD';

export interface JourneyStep {
  id: string;
  timestamp: string;
  type: 'TRANSPORT' | 'SELLER' | 'LOCATION';
  location?: string;
  transporterId?: string;
  transporterName?: string;
  sellerId?: string;
  sellerName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'SOLD' | 'PARTIALLY_SOLD';
  quantity?: number;
  price?: number;
  description?: string;
}

export interface Batch {
  id: string;
  farmerId: string;
  productName: string;
  quantity: number;
  status: BatchStatus;
  createdAt: string;
  transporterId?: string;
  transporterCharge?: number;
  farmerDemandedCharge?: number; // Charge farmer wants to pay
  bookingStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export type BatchStatus = 'CREATED' | 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED';

export interface Transporter {
  id: string;
  name: string;
  vehicleType: string;
  vehicleNumber: string;
  license: string;
  expectedCharge: number; // Base charge per km or per batch
  location?: string;
  available: boolean;
}

export interface Seller {
  id: string;
  shopName: string;
  address: string;
  location: string;
  available: boolean;
}

export interface BookingRequest {
  id: string;
  batchId: string;
  farmerId: string;
  transporterId: string;
  farmerDemandedCharge: number;
  transporterCharge?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  selectedSellerId?: string; // Seller to whom the product should be transported
  product: Product;
  transportDate: string; // ISO date string
}

