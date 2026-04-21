const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/borrowings";
const BOOKS_API = "http://localhost:3000/api/books";
const USERS_API = "http://localhost:3000/api/users";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const borrowings = response.data.data || response.data || [];

    res.render("borrowings/index", {
      title: "Liste des emprunts",
      borrowings,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR BORROWINGS =", error.response?.data || error.message);

    res.render("borrowings/index", {
      title: "Liste des emprunts",
      borrowings: [],
      error:
        error.response?.data?.message ||
        "Impossible de charger les emprunts.",
    });
  }
};

exports.showCreate = async (req, res) => {
  try {
    const token = req.session.user.token;

    const [books, users] = await Promise.all([
      axios.get(BOOKS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    res.render("borrowings/create", {
      title: "Ajouter un emprunt",
      books: books.data.data || [],
      users: users.data || [],
      error: null,
      formData: {},
    });
  } catch (error) {
    console.log("ERREUR SHOW CREATE BORROWING =", error.message);
    res.redirect("/borrowings");
  }
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { userId, bookId, borrowDate, returnDate } = req.body;

    await axios.post(
      API_BASE_URL,
      {
        userId,
        bookId,
        borrowDate,
        returnDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/borrowings");
  } catch (error) {
    console.log("ERREUR CREATE BORROWING =", error.response?.data || error.message);

    res.render("borrowings/create", {
      title: "Ajouter un emprunt",
      books: [],
      users: [],
      error:
        error.response?.data?.message ||
        "Erreur lors de l'ajout de l'emprunt.",
      formData: req.body,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    const [borrowing, books, users] = await Promise.all([
      axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(BOOKS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const borrowingData = borrowing.data.data || borrowing.data;

    res.render("borrowings/edit", {
      title: "Modifier un emprunt",
      borrowing: borrowingData,
      books: books.data.data || [],
      users: users.data || [],
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT BORROWING =", error.message);
    res.redirect("/borrowings");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { userId, bookId, borrowDate, returnDate } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      {
        userId,
        bookId,
        borrowDate,
        returnDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/borrowings");
  } catch (error) {
    console.log("ERREUR UPDATE BORROWING =", error.message);
    res.redirect(`/borrowings/edit/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  try {
    const token = req.session.user.token;

    await axios.delete(`${API_BASE_URL}/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/borrowings");
  } catch (error) {
    console.log("ERREUR DELETE BORROWING =", error.message);
    res.redirect("/borrowings");
  }
};
