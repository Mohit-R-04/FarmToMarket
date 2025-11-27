export type UserRole = 'FARMER' | 'SELLER' | 'TRANSPORTER';

export interface FarmerData {
  name: string;
  location: string;
  authorizedDocument: string; // Document showing rights to do cropping in that location
}

export interface SellerData {
  shopName: string;
  address: string;
  // Note: Seller gets charges for selling which the farmer gives
}

export interface TransporterData {
  vehicleType: string;
  vehicleNumber: string;
  license: string;
  expectedChargePerKm?: number; // Expected charge per kilometer
  // Note: Transporter gets charges for transporting goods between locations
}

export type RoleData = FarmerData | SellerData | TransporterData;

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  roleData?: RoleData;
}

