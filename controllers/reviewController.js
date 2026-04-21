const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/reviews";
const BOOKS_API = "http://localhost:3000/api/books";
const USERS_API = "http://localhost:3000/api/users";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const reviews = response.data.data || response.data || [];

    res.render("reviews/index", {
      title: "Liste des avis",
      reviews,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR REVIEWS =", error.response?.data || error.message);

    res.render("reviews/index", {
      title: "Liste des avis",
      reviews: [],
      error:
        error.response?.data?.message ||
        "Impossible de charger les avis.",
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

    res.render("reviews/create", {
      title: "Ajouter un avis",
      books: books.data.data || [],
      users: users.data || [],
      error: null,
      formData: {},
    });
  } catch (error) {
    console.log("ERREUR SHOW CREATE REVIEW =", error.message);
    res.redirect("/reviews");
  }
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { userId, bookId, rating, review } = req.body;

    await axios.post(
      API_BASE_URL,
      {
        userId,
        bookId,
        rating,
        review,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/reviews");
  } catch (error) {
    console.log("ERREUR CREATE REVIEW =", error.response?.data || error.message);

    res.render("reviews/create", {
      title: "Ajouter un avis",
      books: [],
      users: [],
      error:
        error.response?.data?.message ||
        "Erreur lors de l'ajout de l'avis.",
      formData: req.body,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    const [review, books, users] = await Promise.all([
      axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(BOOKS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const reviewData = review.data.data || review.data;

    res.render("reviews/edit", {
      title: "Modifier un avis",
      review: reviewData,
      books: books.data.data || [],
      users: users.data || [],
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT REVIEW =", error.message);
    res.redirect("/reviews");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { userId, bookId, rating, review } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      {
        userId,
        bookId,
        rating,
        review,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/reviews");
  } catch (error) {
    console.log("ERREUR UPDATE REVIEW =", error.message);
    res.redirect(`/reviews/edit/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  try {
    const token = req.session.user.token;

    await axios.delete(`${API_BASE_URL}/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/reviews");
  } catch (error) {
    console.log("ERREUR DELETE REVIEW =", error.message);
    res.redirect("/reviews");
  }
};
