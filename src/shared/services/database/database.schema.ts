import { type HomeDatabaseSchema } from "@/modules/home/database/schema";
// import { type DeliveryDatabaseSchema } from "@/modules/delivery/database/schema";

export interface Database extends HomeDatabaseSchema {
  // export interface Database extends HomeDatabaseSchema, DeliveryDatabaseSchema {}
}
