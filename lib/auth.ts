import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Garante que a variável existe
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ Missing MONGODB_URI in .env");
}

// Conecta ao MongoDB
const client = new MongoClient(uri);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
