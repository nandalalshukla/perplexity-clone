import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
//import drizzle instance 
import { db } from "@/db/index";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", 
  }),
});
