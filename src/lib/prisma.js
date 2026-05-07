import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // This uses the 'pg' library to talk to Supabase
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis;  

// We export 'db' so we can use it in our project
export const db = globalForPrisma.prisma ?? prismaClientSingleton();  

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

