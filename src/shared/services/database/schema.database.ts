import { Schema } from "@powersync/web";

// Empty schema - PowerSync won't create internal views
// Tables are created manually via Kysely for benchmark flexibility
export const AppSchema = new Schema({});

// TypeScript interfaces for Kysely type safety
export interface RegionTable {
  id: string; // UUID from PowerSync
  region_id: number;
  region_name: string;
}

export interface CountryTable {
  id: string;
  country_id: number;
  country_name: string;
  region_id: number;
}

export interface CustomerTable {
  id: string;
  customer_id: number;
  customer_name: string;
  email: string;
  country_id: number;
}

export interface OrderTable {
  id: string;
  order_id: number;
  order_date: string;
  customer_id: number;
  amount: number;
}

export interface ProductTable {
  id: string;
  product_id: number;
  product_name: string;
  unit_price: number;
}

export interface OrderDetailTable {
  id: string;
  order_detail_id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

// Database schema type for Kysely
export interface Database {
  regions: RegionTable;
  countries: CountryTable;
  customers: CustomerTable;
  orders: OrderTable;
  products: ProductTable;
  order_details: OrderDetailTable;
}
