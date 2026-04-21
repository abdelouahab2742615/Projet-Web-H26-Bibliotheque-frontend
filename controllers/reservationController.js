const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/reservations";
const BOOKS_API = "http://localhost:3000/api/books";
const USERS_API = "http://localhost:3000/api/users";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const reservations = response.data.data || response.data || [];

    res.render("reservations/index", {
      title: "Liste des réservations",
      reservations,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR RESERVATIONS =", error.response?.data || error.message);

    res.render("reservations/index", {
      title: "Liste des réservations",
      reservations: [],
      error:
        error.response?.data?.message ||
        "Impossible de charger les réservations.",
    });
  }
};

exports.showCreate = async (req, res) => {
  try {
    const token = req.session.user.token;

    const [booksResponse, usersResponse] = await Promise.all([
      axios.get(BOOKS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const books = Array.isArray(booksResponse.data) ? booksResponse.data : (booksResponse.data.data || []);
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data.data || []);

    res.render("reservations/create", {
      title: "Ajouter une réservation",
      books,
      users,
      error: null,
      formData: {},
    });
  } catch (error) {
    console.log("ERREUR SHOW CREATE RESERVATION =", error.message);
    res.redirect("/reservations");
  }
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { userId, bookId, expiryDate } = req.body;

    await axios.post(
      API_BASE_URL,
      {
        userId,
        bookId,
        expiryDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/reservations");
  } catch (error) {
    console.log("ERREUR CREATE RESERVATION =", error.response?.data || error.message);

    res.render("reservations/create", {
      title: "Ajouter une réservation",
      books: [],
      users: [],
      error:
        error.response?.data?.message ||
        "Erreur lors de l'ajout de la réservation.",
      formData: req.body,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    const [reservation, books, users] = await Promise.all([
      axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(BOOKS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const reservationData = reservation.data.data || reservation.data;

    res.render("reservations/edit", {
      title: "Modifier une réservation",
      reservation: reservationData,
      books: books.data.data || [],
      users: users.data || [],
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT RESERVATION =", error.message);
    res.redirect("/reservations");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { userId, bookId, expiryDate } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      {
        userId,
        bookId,
        expiryDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/reservations");
  } catch (error) {
    console.log("ERREUR UPDATE RESERVATION =", error.message);
    res.redirect(`/reservations/edit/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  try {
    const token = req.session.user.token;

    await axios.delete(`${API_BASE_URL}/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/reservations");
  } catch (error) {
    console.log("ERREUR DELETE RESERVATION =", error.message);
    res.redirect("/reservations");
  }
};
