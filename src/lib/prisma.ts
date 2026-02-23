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
  userProfile: [
    "personalInfo",
    "workExperience",
    "education",
    "skills",
    "certificates",
  ],
  resume: [
    "personalInfo",
    "workExperience",
    "education",
    "skills",
    "certificates",
    "customization",
  ],
  resumeVariant: ["reasoning", "selectedSkills", "selectedExp", "keywords"],
};

// Fields that are stored as JSON and need stringify/parse
const JSON_FIELDS = new Set([
  "personalInfo",
  "workExperience",
  "education",
  "skills",
  "certificates",
  "customization",
  "selectedSkills",
  "selectedExp",
  "keywords",
]);

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
          const encryptRecursive = (data: any) => {
            if (!data || typeof data !== "object") return;

            if (Array.isArray(data)) {
              data.forEach(encryptRecursive);
              return;
            }

            // Check if this object contains any fields that need encryption for ANY model
            for (const [mKey, fields] of Object.entries(
              ENCRYPTED_FIELDS_BY_MODEL,
            )) {
              for (const field of fields) {
                // IMPORTANT: Only encrypt if it's not already encrypted (to avoid double encryption)
                // and if it exists in the current object
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
              if (data[key] && typeof data[key] === "object") {
                encryptRecursive(data[key]);
              }
            }
          };

          if (operation === "upsert") {
            encryptRecursive((args as any).create);
            encryptRecursive((args as any).update);
          } else if (operation === "createMany" || operation === "updateMany") {
            if (Array.isArray((args as any).data)) {
              (args as any).data.forEach(encryptRecursive);
            } else {
              encryptRecursive((args as any).data);
            }
          } else {
            encryptRecursive((args as any).data);
          }
        }

        // 2. Execute Query
        const result = await query(args);

        // 3. Handle Reads (Decrypt results recursively)
        if (result) {
          const decryptRecursive = (item: any) => {
            if (!item || typeof item !== "object") return;

            if (Array.isArray(item)) {
              item.forEach(decryptRecursive);
              return;
            }

            // Check if this object has any fields that we know should be encrypted
            // We search through all models in our map to be safe with nested relations
            for (const [modelKey, fields] of Object.entries(
              ENCRYPTED_FIELDS_BY_MODEL,
            )) {
              for (const field of fields) {
                if (
                  item[field] &&
                  typeof item[field] === "string" &&
                  item[field].includes(":")
                ) {
                  try {
                    const decrypted = decrypt(item[field]);
                    item[field] = JSON_FIELDS.has(field)
                      ? JSON.parse(decrypted)
                      : decrypted;
                  } catch (e) {
                    // Decryption failed - likely not encrypted or wrong key, ignore
                  }
                }
              }
            }

            // Recurse into all properties to catch relations (e.g. user.aiKeys)
            for (const key of Object.keys(item)) {
              if (item[key] && typeof item[key] === "object") {
                decryptRecursive(item[key]);
              }
            }
          };

          decryptRecursive(result);
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
