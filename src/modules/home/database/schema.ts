import type { Generated } from "kysely";

// Region Table
export interface RegionTable {
  region_id: number;
  region_name: string;
}

// Country Table
export interface CountryTable {
  country_id: number;
  country_name: string;
  region_id: number;
}

// Customer Table
export interface CustomerTable {
  customer_id: number;
  customer_name: string;
  country_id: number;
}

// Order Table
export interface OrderTable {
  order_id: number;
  customer_id: number;
  order_date: string;
}

// Product Table
export interface ProductTable {
  product_id: number;
  product_name: string;
  unit_price: number;
}

// Order Detail Table
export interface OrderDetailTable {
  order_detail_id: Generated<number>;
  order_id: number;
  product_id: number;
  quantity: number;
}

// Home Database Schema
export interface HomeDatabaseSchema {
  regions: RegionTable;
  countries: CountryTable;
  customers: CustomerTable;
  orders: OrderTable;
  products: ProductTable;
  order_details: OrderDetailTable;
}
