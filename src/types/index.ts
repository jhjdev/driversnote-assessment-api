export interface User {
  id: number;
  full_name: string;
  tag: string;
}

export interface CreateUserRequest {
  full_name: string;
  tag: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  tag?: string;
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
  },
  required: ['id', 'full_name'],
} as const;

export const createUserSchema = {
  type: 'object',
  properties: {
    full_name: { type: 'string' },
    tag: { type: 'string' },
  },
  required: ['full_name', 'tag'],
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
