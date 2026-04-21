const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/authors";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const authors = response.data.data || response.data || [];

    res.render("authors/index", {
      title: "Liste des auteurs",
      authors,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR AUTHORS =", error.response?.data || error.message);

    res.render("authors/index", {
      title: "Liste des auteurs",
      authors: [],
      error:
        error.response?.data?.message ||
        "Impossible de charger les auteurs.",
    });
  }
};

exports.showCreate = (req, res) => {
  res.render("authors/create", {
    title: "Ajouter un auteur",
    error: null,
    formData: {},
  });
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { firstName, lastName, biography } = req.body;

    await axios.post(
      API_BASE_URL,
      {
        firstName,
        lastName,
        biography,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/authors");
  } catch (error) {
    console.log("ERREUR CREATE AUTHOR =", error.response?.data || error.message);

    res.render("authors/create", {
      title: "Ajouter un auteur",
      error:
        error.response?.data?.message ||
        "Erreur lors de l'ajout de l'auteur.",
      formData: req.body,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const author = response.data.data || response.data;

    res.render("authors/edit", {
      title: "Modifier un auteur",
      author,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT AUTHOR =", error.response?.data || error.message);
    res.redirect("/authors");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { firstName, lastName, biography } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      {
        firstName,
        lastName,
        biography,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/authors");
  } catch (error) {
    console.log("ERREUR UPDATE AUTHOR =", error.response?.data || error.message);

    res.render("authors/edit", {
      title: "Modifier un auteur",
      author: { id, ...req.body },
      error:
        error.response?.data?.message ||
        "Erreur lors de la modification.",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.redirect("/authors");
  } catch (error) {
    console.log("ERREUR DELETE AUTHOR =", error.response?.data || error.message);
    res.redirect("/authors");
  }
};
