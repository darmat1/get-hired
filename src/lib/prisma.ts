import { PrismaClient } from "../generated/client";
import { encrypt, decrypt } from "./encryption";

const prismaBase = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Configuration for fields that need transparent encryption
const ENCRYPTED_FIELDS_BY_MODEL: Record<string, string[]> = {
  user: ["accessToken", "refreshToken"],
  aiCredential: ["key"],
  account: ["accessToken", "refreshToken", "idToken", "password"],
};

// Relation name -> model name (Prisma relation names don't always match model names)
const RELATION_TO_MODEL: Record<string, string> = {
  aiKeys: "aiCredential",
};

// Fields that are stored as JSON and need stringify/parse (Legacy, now using native Json type)
const JSON_FIELDS = new Set<string>([]);

/**
 * Transparently encrypt/decrypt sensitive fields
 */
export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const modelLower = model.charAt(0).toLowerCase() + model.slice(1);
        const encryptedFields = ENCRYPTED_FIELDS_BY_MODEL[modelLower];

        // 1. Handle Writes (Encrypt on create/update)
        if (
          ["create", "update", "upsert", "createMany", "updateMany"].includes(
            operation,
          )
        ) {
          const encryptRecursive = (data: any, currentModel: string | null) => {
            if (!data || typeof data !== "object") return;

            if (Array.isArray(data)) {
              data.forEach((item) => encryptRecursive(item, currentModel));
              return;
            }

            // If we know the model, only check its specific fields
            if (currentModel && ENCRYPTED_FIELDS_BY_MODEL[currentModel]) {
              for (const field of ENCRYPTED_FIELDS_BY_MODEL[currentModel]) {
                if (data[field] !== undefined && data[field] !== null) {
                  const val = data[field];
                  // If it's a string that already matches our encryption format, skip it
                  if (typeof val === "string" && val.split(":").length === 3) {
                    continue;
                  }

                  const stringVal = JSON_FIELDS.has(field)
                    ? JSON.stringify(val)
                    : String(val);
                  data[field] = encrypt(stringVal);
                }
              }
            }

            // Recurse into nested fields (e.g. data: { aiKeys: { create: { ... } } })
            for (const key of Object.keys(data)) {
              const value = data[key];
              if (value && typeof value === "object") {
                // Determine model for nested relations if possible
                let nextModel: string | null = null;
                if (key === "create" || key === "update" || key === "upsert" || key === "connectOrCreate") {
                  nextModel = currentModel;
                } else if (key === "data") {
                  nextModel = currentModel;
                } else {
                  // Prefer explicit mapping, then heuristic
                  nextModel = RELATION_TO_MODEL[key] ?? (key.endsWith("s") ? key.slice(0, -1) : key);
                  if (!ENCRYPTED_FIELDS_BY_MODEL[nextModel]) nextModel = null;
                }
                encryptRecursive(value, nextModel);
              }
            }
          };

          if (operation === "upsert") {
            encryptRecursive((args as any).create, modelLower);
            encryptRecursive((args as any).update, modelLower);
          } else if (operation === "createMany" || operation === "updateMany") {
            if (Array.isArray((args as any).data)) {
              (args as any).data.forEach((item: any) => encryptRecursive(item, modelLower));
            } else {
              encryptRecursive((args as any).data, modelLower);
            }
          } else {
            encryptRecursive((args as any).data, modelLower);
          }
        }

        // 2. Execute Query
        const result = await query(args);

        // 3. Handle Reads (Decrypt results recursively)
        if (result) {
          const decryptRecursive = (item: any, currentModel: string | null) => {
            if (!item || typeof item !== "object") return;

            if (Array.isArray(item)) {
              item.forEach((i) => decryptRecursive(i, currentModel));
              return;
            }

            // Only check fields for the current model to avoid unnecessary loops
            if (currentModel && ENCRYPTED_FIELDS_BY_MODEL[currentModel]) {
              for (const field of ENCRYPTED_FIELDS_BY_MODEL[currentModel]) {
                if (item[field] && typeof item[field] === "string") {
                  try {
                    let val = item[field];
                    let wasEncrypted = false;
                    // If it's encrypted, decrypt first
                    if (val.includes(":")) {
                      val = decrypt(val);
                      wasEncrypted = true;
                    }

                    // If it was encrypted, update with decrypted value
                    if (wasEncrypted) {
                      item[field] = val;
                    }
                  } catch (e) {
                    // Ignore failures
                  }
                }
              }
            }

            // Recurse into relations
              for (const key of Object.keys(item)) {
                const value = item[key];
                if (value && typeof value === "object") {
                  let nextModel: string | null = RELATION_TO_MODEL[key] ?? (key.endsWith("s") ? key.slice(0, -1) : key);
                  if (!ENCRYPTED_FIELDS_BY_MODEL[nextModel]) nextModel = null;
                  decryptRecursive(value, nextModel);
                }
              }
          };

          decryptRecursive(result, modelLower);
        }

        return result;
      },
    },
  },
});

const globalForPrisma = globalThis as unknown as {
  prismaCustom: typeof prisma | undefined;
};

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaCustom = prisma;
