// Centralized API service for backend calls
export const API_BASE = 'http://localhost:8080/api';

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return res.json();
}

import type { Product, BookingRequest } from '@/types/product';

export async function createProduct(product: Product) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (res.ok) {
    return { success: true };
  }
  throw new Error('Failed to delete product');
}

export async function getBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  return res.json();
}

export async function createBooking(booking: BookingRequest) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  return res.json();
}

export async function createTransporterRequest(request: any) {
  const res = await fetch(`${API_BASE}/transporter-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function getTransporterRequests() {
  const res = await fetch(`${API_BASE}/transporter-requests`);
  return res.json();
}

export async function updateTransporterRequest(id: string, update: any) {
  const res = await fetch(`${API_BASE}/transporter-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return res.json();
}

export async function updateBooking(id: string, update: any) {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return res.json();
}

export async function getSellerRequests() {
  const res = await fetch(`${API_BASE}/seller-requests`);
  return res.json();
}

export async function createSellerRequest(request: any) {
  const res = await fetch(`${API_BASE}/seller-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function updateSellerRequest(id: string, update: any) {
  const res = await fetch(`${API_BASE}/seller-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return res.json();
}

// User & Role Management
export async function getUserRole(userId: string) {
  const res = await fetch(`${API_BASE}/roles/user/${userId}`);
  return res.json();
}

export async function saveUserRole(role: string, roleData: any) {
  const res = await fetch(`${API_BASE}/roles/${role}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData),
  });
  return res.json();
}

export async function updateUserRole(userId: string, role: string, roleData: any) {
  const res = await fetch(`${API_BASE}/roles/${role}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData),
  });
  if (!res.ok) {
    throw new Error('Failed to update user profile');
  }
  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (res.status === 404) return null;
  // Handle empty response body if necessary
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getUsersByRole(role: string) {
  const res = await fetch(`${API_BASE}/roles/${role}`);
  return res.json();
}

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(`GET ${url} failed`);
    return res.json();
  },
  post: async <T>(url: string, body: any): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${url} failed`);
    return res.json();
  },
  put: async <T>(url: string, body: any): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed`);
    return res.json();
  },
  delete: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`DELETE ${url} failed`);
    return res.json() as Promise<T>;
  }
};
