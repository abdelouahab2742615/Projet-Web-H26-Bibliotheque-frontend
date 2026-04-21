const express = require("express");
const {
  buildReservationPayload,
  createItem,
  deleteItem,
  extractItems,
  extractPagination,
  getCollection,
  getItemById,
  normalizeReservation,
  updateItem,
} = require("../lib/backend-api");

const router = express.Router();

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

function resolveToken(req) {
  return req.session.authToken || process.env.DEFAULT_AUTH_TOKEN || "";
}

function buildReservationValues(source = {}) {
  return {
    userId: source.userId ? String(source.userId) : "",
    bookId: source.bookId ? String(source.bookId) : "",
    reservationDate: source.reservationDate || source.dateReservation || new Date().toISOString().slice(0, 10),
    expiryDate: source.expiryDate || "",
    status: source.status || source.statut || "pending",
  };
}

function validateReservation(values) {
  const errors = {};
  const allowedStatuses = statusOptions.map((option) => option.value);

  if (!values.userId.trim() || !/^\d+$/.test(values.userId.trim())) {
    errors.userId = "Un identifiant utilisateur numerique est obligatoire.";
  }

  if (!values.bookId.trim() || !/^\d+$/.test(values.bookId.trim())) {
    errors.bookId = "Un identifiant livre numerique est obligatoire.";
  }

  if (!values.reservationDate || Number.isNaN(Date.parse(values.reservationDate))) {
    errors.reservationDate = "La date de reservation doit etre valide.";
  }

  if (!values.expiryDate || Number.isNaN(Date.parse(values.expiryDate))) {
    errors.expiryDate = "La date d'expiration doit etre valide.";
  }

  if (!allowedStatuses.includes(values.status)) {
    errors.status = "Le statut choisi est invalide.";
  }

  return errors;
}

async function loadReservationOptions(token) {
  const [usersResult, booksResult] = await Promise.allSettled([
    getCollection("users", { token, query: { limit: 100 } }),
    getCollection("books", { token, query: { limit: 100 } }),
  ]);

  const optionWarnings = [];

  const users =
    usersResult.status === "fulfilled"
      ? extractItems(usersResult.value).map((user) => ({
          value: String(user.id),
          label: `${user.username || user.email || `Utilisateur #${user.id}`}${
            user.Role?.name ? ` - ${user.Role.name}` : ""
          }`,
        }))
      : [];

  if (usersResult.status === "rejected") {
    optionWarnings.push("La liste des utilisateurs n'a pas pu etre chargee. Tu peux saisir l'ID a la main.");
  }

  const books =
    booksResult.status === "fulfilled"
      ? extractItems(booksResult.value).map((book) => ({
          value: String(book.id),
          label: `${book.title || `Livre #${book.id}`}${book.isbn ? ` (${book.isbn})` : ""}`,
        }))
      : [];

  if (booksResult.status === "rejected") {
    optionWarnings.push("La liste des livres n'a pas pu etre chargee. Tu peux saisir l'ID a la main.");
  }

  return { users, books, optionWarnings };
}

function renderReservationForm(res, view, locals) {
  const hasErrors = locals.formError || Object.keys(locals.errors).length > 0;
  res.status(hasErrors ? 400 : 200).render(view, locals);
}

router.get("/", async (req, res) => {
  const token = resolveToken(req);
  let reservations = [];
  let pageError = null;
  let authRequired = false;
  let pagination = {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  try {
    const payload = await getCollection("reservations", {
      token,
      query: { limit: 100 },
    });

    reservations = extractItems(payload).map(normalizeReservation);
    pagination = extractPagination(payload, reservations.length);
  } catch (error) {
    pageError = error.message;
    authRequired = error.status === 401 || error.status === 403;
  }

  res.render("reservations/index", {
    title: "Reservations",
    reservations,
    pageError,
    authRequired,
    pagination,
    statusOptions,
  });
});

router.get("/create", async (req, res) => {
  const token = resolveToken(req);
  const { users, books, optionWarnings } = await loadReservationOptions(token);

  renderReservationForm(res, "reservations/create", {
    title: "Ajouter une reservation",
    values: buildReservationValues(),
    errors: {},
    formError: null,
    users,
    books,
    optionWarnings,
    statusOptions,
  });
});

router.post("/create", async (req, res) => {
  const token = resolveToken(req);
  const values = buildReservationValues(req.body);
  const errors = validateReservation(values);

  if (Object.keys(errors).length > 0) {
    const { users, books, optionWarnings } = await loadReservationOptions(token);

    return renderReservationForm(res, "reservations/create", {
      title: "Ajouter une reservation",
      values,
      errors,
      formError: null,
      users,
      books,
      optionWarnings,
      statusOptions,
    });
  }

  try {
    await createItem("reservations", buildReservationPayload(values), { token });
    req.session.flash = {
      type: "success",
      message: "Reservation ajoutee avec succes.",
    };
    res.redirect("/reservations");
  } catch (error) {
    const { users, books, optionWarnings } = await loadReservationOptions(token);

    renderReservationForm(res, "reservations/create", {
      title: "Ajouter une reservation",
      values,
      errors: {},
      formError: error.message,
      users,
      books,
      optionWarnings,
      statusOptions,
    });
  }
});

router.get("/:id/edit", async (req, res) => {
  const token = resolveToken(req);

  try {
    const reservation = await getItemById("reservations", req.params.id, { token });
    const { users, books, optionWarnings } = await loadReservationOptions(token);

    renderReservationForm(res, "reservations/edit", {
      title: "Modifier une reservation",
      values: buildReservationValues(normalizeReservation(reservation)),
      errors: {},
      formError: null,
      users,
      books,
      optionWarnings,
      statusOptions,
      reservationId: req.params.id,
    });
  } catch (error) {
    req.session.flash = {
      type: "error",
      message: error.message,
    };
    res.redirect("/reservations");
  }
});

router.post("/:id/edit", async (req, res) => {
  const token = resolveToken(req);
  const values = buildReservationValues(req.body);
  const errors = validateReservation(values);

  if (Object.keys(errors).length > 0) {
    const { users, books, optionWarnings } = await loadReservationOptions(token);

    return renderReservationForm(res, "reservations/edit", {
      title: "Modifier une reservation",
      values,
      errors,
      formError: null,
      users,
      books,
      optionWarnings,
      statusOptions,
      reservationId: req.params.id,
    });
  }

  try {
    await updateItem("reservations", req.params.id, buildReservationPayload(values), { token });
    req.session.flash = {
      type: "success",
      message: "Reservation mise a jour avec succes.",
    };
    res.redirect("/reservations");
  } catch (error) {
    const { users, books, optionWarnings } = await loadReservationOptions(token);

    renderReservationForm(res, "reservations/edit", {
      title: "Modifier une reservation",
      values,
      errors: {},
      formError: error.message,
      users,
      books,
      optionWarnings,
      statusOptions,
      reservationId: req.params.id,
    });
  }
});

router.post("/:id/delete", async (req, res) => {
  const token = resolveToken(req);

  try {
    await deleteItem("reservations", req.params.id, { token });
    req.session.flash = {
      type: "success",
      message: "Reservation supprimee avec succes.",
    };
  } catch (error) {
    req.session.flash = {
      type: "error",
      message: error.message,
    };
  }

  res.redirect("/reservations");
});

module.exports = router;
