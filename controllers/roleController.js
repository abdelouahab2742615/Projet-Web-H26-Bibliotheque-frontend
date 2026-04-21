const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/roles";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const roles = Array.isArray(response.data) ? response.data : [];

    res.render("roles/index", {
      title: "Liste des rôles",
      roles,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR ROLES =", error.response?.data || error.message);

    res.render("roles/index", {
      title: "Liste des rôles",
      roles: [],
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Impossible de charger les rôles.",
    });
  }
};

exports.showCreate = (req, res) => {
  res.render("roles/create", {
    title: "Ajouter un rôle",
    error: null,
    formData: {},
  });
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { name } = req.body;

    await axios.post(
      API_BASE_URL,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/roles");
  } catch (error) {
    console.log("ERREUR CREATE ROLE =", error.response?.data || error.message);

    res.render("roles/create", {
      title: "Ajouter un rôle",
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erreur lors de l'ajout du rôle.",
      formData: { name },
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

    const role = response.data;

    res.render("roles/edit", {
      title: "Modifier un rôle",
      role,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT ROLE =", error.response?.data || error.message);
    res.redirect("/roles");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { name } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/roles");
  } catch (error) {
    console.log("ERREUR UPDATE ROLE =", error.response?.data || error.message);

    res.render("roles/edit", {
      title: "Modifier un rôle",
      role: {
        id: req.params.id,
        name: req.body.name,
      },
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erreur lors de la modification du rôle.",
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

    res.redirect("/roles");
  } catch (error) {
    console.log("ERREUR DELETE ROLE =", error.response?.data || error.message);
    res.redirect("/roles");
  }
};