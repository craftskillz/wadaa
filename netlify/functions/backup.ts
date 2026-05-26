import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import { parseLocalDataExport } from "../../src/lib/db/validation";

const STORE_NAME = "user-backups";
const PLACEHOLDER_USER_ID = "local";
const BACKUP_BLOB_KEY = `users/${PLACEHOLDER_USER_ID}/backup.json`;
const BACKUP_KEY_HEADER = "x-backup-key";
const BACKUP_KEY_ENV = "BACKUP_KEY";

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_SERVER_ERROR = 500;

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function textResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  const expectedKey = process.env[BACKUP_KEY_ENV];
  const providedKey = request.headers.get(BACKUP_KEY_HEADER);

  if (!expectedKey) {
    return textResponse(
      "Configuration manquante : BACKUP_KEY n'est pas défini sur le serveur.",
      HTTP_SERVER_ERROR,
    );
  }

  if (!providedKey || providedKey !== expectedKey) {
    return textResponse("Clé de sauvegarde manquante ou invalide.", HTTP_UNAUTHORIZED);
  }

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (request.method === "GET") {
    const stored = await store.get(BACKUP_BLOB_KEY, { type: "json" });
    if (!stored) {
      return textResponse("Aucune sauvegarde trouvée.", HTTP_NOT_FOUND);
    }
    return jsonResponse(stored, HTTP_OK);
  }

  if (request.method === "PUT") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return textResponse("Corps de requête JSON invalide.", HTTP_BAD_REQUEST);
    }

    let validatedBackup;
    try {
      validatedBackup = parseLocalDataExport(payload);
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : "Sauvegarde invalide.";
      return textResponse(reason, HTTP_BAD_REQUEST);
    }

    try {
      await store.setJSON(BACKUP_BLOB_KEY, validatedBackup);
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : "Écriture impossible sur Netlify Blobs.";
      return textResponse(reason, HTTP_SERVER_ERROR);
    }

    return new Response(null, { status: HTTP_NO_CONTENT });
  }

  return textResponse(
    `Méthode ${request.method} non supportée.`,
    HTTP_METHOD_NOT_ALLOWED,
  );
}

export const config: Config = {
  path: "/api/backup",
};
