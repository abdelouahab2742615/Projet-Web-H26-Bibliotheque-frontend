const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/categories";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const categories = response.data.data || [];

    res.render("categories/index", {
      title: "Liste des catégories",
      categories,
      error: null,
    });
  } catch (error) {
    console.log(error);

    res.render("categories/index", {
      title: "Liste des catégories",
      categories: [],
      error: "Erreur lors du chargement",
    });
  }
};

exports.showCreate = (req, res) => {
  res.render("categories/create", {
    title: "Ajouter une catégorie",
    error: null,
    formData: {},
  });
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { name, description } = req.body;

    await axios.post(API_BASE_URL, { name, description }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/categories");
  } catch (error) {
    res.render("categories/create", {
      title: "Ajouter une catégorie",
      error: "Erreur création",
      formData: req.body,
    });
  }
};

exports.showEdit = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(`${API_BASE_URL}/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.render("categories/edit", {
      title: "Modifier",
      category: response.data,
      error: null,
    });
  } catch {
    res.redirect("/categories");
  }
};

exports.update = async (req, res) => {
 try {
   const token = req.session.user.token;
   await axios.put(`${API_BASE_URL}/${req.params.id}`, req.body, {
     headers: { Authorization: `Bearer ${token}` },
   });
   res.redirect("/categories");
 } catch (error) {
   res.render("categories/edit", {
     title: "Modifier",
     category: { id: req.params.id, ...req.body },
     error: "Erreur modification",
   });
 }
};

exports.delete = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;

    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.redirect("/categories");
  } catch (error) {
    console.log("ERREUR DELETE CATEGORY =", error.message);
    res.redirect("/categories");
  }
};
