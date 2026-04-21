const axios = require("axios");

const BOOKS_API = "http://localhost:3000/api/books";
const AUTHORS_API = "http://localhost:3000/api/authors";
const CATEGORIES_API = "http://localhost:3000/api/categories";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(BOOKS_API, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.render("books/index", {
      title: "Livres",
      books: response.data.data || [],
      error: null,
    });
  } catch {
    res.render("books/index", {
      title: "Livres",
      books: [],
      error: "Erreur chargement",
    });
  }
};

exports.showCreate = async (req, res) => {
  const token = req.session.user.token;

  const [authors, categories] = await Promise.all([
    axios.get(AUTHORS_API, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(CATEGORIES_API, { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  res.render("books/create", {
    title: "Ajouter livre",
    authors: authors.data.data || [],
    categories: categories.data.data || [],
    formData: {},
    error: null,
  });
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;

    await axios.post(BOOKS_API, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/books");
  } catch {
    res.redirect("/books/create");
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    const [book, authors, categories] = await Promise.all([
      axios.get(`${BOOKS_API}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(AUTHORS_API, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(CATEGORIES_API, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    res.render("books/edit", {
      title: "Modifier un livre",
      book: book.data.data || book.data,
      authors: authors.data.data || [],
      categories: categories.data.data || [],
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT BOOK =", error.message);
    res.redirect("/books");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    await axios.put(`${BOOKS_API}/${id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/books");
  } catch (error) {
    console.log("ERREUR UPDATE BOOK =", error.message);
    res.redirect(`/books/edit/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  const token = req.session.user.token;

  await axios.delete(`${BOOKS_API}/${req.params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  res.redirect("/books");
};
