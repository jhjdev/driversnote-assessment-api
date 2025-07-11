export interface User {
  id: number;
  full_name: string;
  tag?: string;
  address1?: string | null;
  address2?: string | null;
  postal_code?: number | string | null;
  city?: string | null;
  country_name?: string;
  country_id?: string;
  organisation_id?: number | null;
}

export interface CreateUserRequest {
  full_name: string;
  tag?: string;
  address1?: string | null;
  address2?: string | null;
  postal_code?: number | string | null;
  city?: string | null;
  country_name?: string;
  country_id?: string;
  organisation_id?: number | null;
}

export interface UpdateUserRequest {
  full_name?: string;
  tag?: string;
  address1?: string | null;
  address2?: string | null;
  postal_code?: number | string | null;
  city?: string | null;
  country_name?: string;
  country_id?: string;
  organisation_id?: number | null;
}

export interface Receipt {
  id: string;
  userId: number;
  userName: string;
  beaconQuantity: number;
  discount: number;
  deliveryAddress: string;
  totalPrice: number;
  timestamp: string;
}

export interface CreateReceiptRequest {
  userId: number;
  userName: string;
  beaconQuantity: number;
  discount: number;
  deliveryAddress: string;
  totalPrice: number;
}

export interface InitializeUsersRequest {
  users: User[];
}

export interface InitializeUsersResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  version: string;
}

// Swagger schema definitions
export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    full_name: { type: 'string' },
    tag: { type: 'string' },
    address1: { type: 'string', nullable: true },
    address2: { type: 'string', nullable: true },
    postal_code: { type: ['number', 'string'], nullable: true },
    city: { type: 'string', nullable: true },
    country_name: { type: 'string' },
    country_id: { type: 'string' },
    organisation_id: { type: 'number', nullable: true },
  },
  required: ['id', 'full_name'],
} as const;

export const createUserSchema = {
  type: 'object',
  properties: {
    full_name: { type: 'string' },
    tag: { type: 'string' },
    address1: { type: 'string', nullable: true },
    address2: { type: 'string', nullable: true },
    postal_code: { type: ['number', 'string'], nullable: true },
    city: { type: 'string', nullable: true },
    country_name: { type: 'string' },
    country_id: { type: 'string' },
    organisation_id: { type: 'number', nullable: true },
  },
  required: ['full_name'],
} as const;

export const receiptSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'number' },
    userName: { type: 'string' },
    beaconQuantity: { type: 'number' },
    discount: { type: 'number' },
    deliveryAddress: { type: 'string' },
    totalPrice: { type: 'number' },
    timestamp: { type: 'string' },
  },
  required: ['id', 'userId', 'userName', 'beaconQuantity', 'discount', 'deliveryAddress', 'totalPrice', 'timestamp'],
} as const;

export const createReceiptSchema = {
  type: 'object',
  properties: {
    userId: { type: 'number' },
    userName: { type: 'string' },
    beaconQuantity: { type: 'number' },
    discount: { type: 'number' },
    deliveryAddress: { type: 'string' },
    totalPrice: { type: 'number' },
  },
  required: ['userId', 'userName', 'beaconQuantity', 'discount', 'deliveryAddress', 'totalPrice'],
} as const;
