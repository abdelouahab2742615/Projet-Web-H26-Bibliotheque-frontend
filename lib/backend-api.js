const DEFAULT_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const apiConfig = {
  backendUrl: DEFAULT_BACKEND_URL,
  paths: {
    publishers: process.env.PUBLISHERS_API_PATH || "/api/publishers",
    reservations: process.env.RESERVATIONS_API_PATH || "/api/reservations",
    users: process.env.USERS_API_PATH || "/api/users",
    books: process.env.BOOKS_API_PATH || "/api/books",
  },
};

class BackendApiError extends Error {
  constructor(message, { status = 500, payload = null } = {}) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.payload = payload;
  }
}

function compactObject(source) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function getApiPath(key) {
  return apiConfig.paths[key];
}

function buildUrl(pathname, query) {
  const baseUrl = apiConfig.backendUrl.endsWith("/") ? apiConfig.backendUrl : `${apiConfig.backendUrl}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const url = new URL(normalizedPath, baseUrl);

  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveErrorMessage(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload.error && payload.details) {
    return `${payload.error} (${payload.details})`;
  }

  if (payload.error) {
    return payload.error;
  }

  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .map((entry) => entry.msg || entry.message || entry.error)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (payload.message) {
    return payload.message;
  }

  return fallbackMessage;
}

async function apiRequest(pathname, { method = "GET", token, query, body } = {}) {
  const url = buildUrl(pathname, query);
  const headers = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new BackendApiError(
      `Impossible de joindre le backend sur ${apiConfig.backendUrl}. Verifie BACKEND_URL et le serveur API.`,
      {
        status: 503,
        payload: error,
      },
    );
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new BackendApiError(resolveErrorMessage(payload, "Erreur backend."), {
      status: response.status,
      payload,
    });
  }

  return payload;
}

function extractItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function extractPagination(payload, itemCount) {
  if (Array.isArray(payload)) {
    return {
      total: itemCount,
      page: 1,
      totalPages: 1,
    };
  }

  return {
    total: payload?.total ?? itemCount,
    page: payload?.page ?? 1,
    totalPages: payload?.totalPages ?? 1,
  };
}

function toInteger(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePublisher(entry = {}) {
  return {
    id: entry.id,
    nom: entry.nom || entry.name || "",
    pays: entry.pays || entry.country || "",
    telephone: entry.telephone || entry.phone || "",
  };
}

function normalizeReservation(entry = {}) {
  const reservationDate = entry.reservationDate || entry.dateReservation || "";
  const expiryDate = entry.expiryDate || "";
  const status = entry.status || entry.statut || "pending";
  const userId = entry.userId ?? entry.User?.id ?? "";
  const bookId = entry.bookId ?? entry.Book?.id ?? "";
  const userName = entry.User?.username || entry.user?.username || "";
  const userEmail = entry.User?.email || entry.user?.email || "";
  const bookTitle = entry.Book?.title || entry.book?.title || "";
  const bookIsbn = entry.Book?.isbn || entry.book?.isbn || "";

  return {
    id: entry.id,
    userId,
    bookId,
    reservationDate: reservationDate ? String(reservationDate).slice(0, 10) : "",
    expiryDate: expiryDate ? String(expiryDate).slice(0, 10) : "",
    status,
    userLabel: userName
      ? `${userName}${userEmail ? ` (${userEmail})` : ""}`
      : userId
        ? `Utilisateur #${userId}`
        : "Utilisateur inconnu",
    bookLabel: bookTitle
      ? `${bookTitle}${bookIsbn ? ` (${bookIsbn})` : ""}`
      : bookId
        ? `Livre #${bookId}`
        : "Livre inconnu",
  };
}

function buildPublisherPayload(values) {
  return compactObject({
    nom: values.nom?.trim(),
    pays: values.pays?.trim(),
    telephone: values.telephone?.trim(),
  });
}

function buildReservationPayload(values) {
  const reservationDate = values.reservationDate || values.dateReservation || new Date().toISOString().slice(0, 10);
  const status = values.status || values.statut || "pending";

  return compactObject({
    userId: toInteger(values.userId),
    bookId: toInteger(values.bookId),
    reservationDate,
    dateReservation: reservationDate,
    expiryDate: values.expiryDate,
    status,
    statut: status,
  });
}

function getCollection(key, options = {}) {
  return apiRequest(getApiPath(key), options);
}

function getItemById(key, id, options = {}) {
  return apiRequest(`${getApiPath(key)}/${id}`, options);
}

function createItem(key, body, options = {}) {
  return apiRequest(getApiPath(key), {
    ...options,
    method: "POST",
    body,
  });
}

function updateItem(key, id, body, options = {}) {
  return apiRequest(`${getApiPath(key)}/${id}`, {
    ...options,
    method: "PUT",
    body,
  });
}

function deleteItem(key, id, options = {}) {
  return apiRequest(`${getApiPath(key)}/${id}`, {
    ...options,
    method: "DELETE",
  });
}

module.exports = {
  BackendApiError,
  apiConfig,
  apiRequest,
  buildPublisherPayload,
  buildReservationPayload,
  createItem,
  deleteItem,
  extractItems,
  extractPagination,
  getCollection,
  getItemById,
  normalizePublisher,
  normalizeReservation,
  updateItem,
};
