import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "../config";

export const db = drizzle(DATABASE_URL!);
