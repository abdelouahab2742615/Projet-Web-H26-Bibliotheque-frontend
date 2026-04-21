const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/users";

exports.index = async (req, res) => {
  try {
    const token = req.session.user.token;

    const response = await axios.get(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("REPONSE API USERS =", response.data);

    let users = response.data;

// 🔥 transformation FORCÉE en tableau
if (!Array.isArray(users)) {
  if (Array.isArray(users.users)) {
    users = users.users;
  } else if (Array.isArray(users.data)) {
    users = users.data;
  } else if (users.users && Array.isArray(users.users.rows)) {
    users = users.users.rows;
  } else if (users.data && Array.isArray(users.data.rows)) {
    users = users.data.rows;
  } else {
    users = [];
  }
}

console.log("USERS FINAL =", users);

    if (Array.isArray(response.data)) {
      users = response.data;
    } else if (Array.isArray(response.data.users)) {
      users = response.data.users;
    } else if (Array.isArray(response.data.data)) {
      users = response.data.data;
    } else if (response.data.users && Array.isArray(response.data.users.rows)) {
      users = response.data.users.rows;
    } else if (response.data.data && Array.isArray(response.data.data.rows)) {
      users = response.data.data.rows;
    }

    res.render("users/index", {
      title: "Liste des utilisateurs",
      users,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR USERS =", error.response?.data || error.message);

    res.render("users/index", {
      title: "Liste des utilisateurs",
      users: [],
      error:
        error.response?.data?.message ||
        "Impossible de charger les utilisateurs.",
    });
  }
};

exports.showCreate = (req, res) => {
  res.render("users/create", {
    title: "Ajouter un utilisateur",
    formData: {},
    error: null,
  });
};

exports.create = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { username, email, password, roleId } = req.body;

    await axios.post(
      `${API_BASE_URL}/register`,
      {
        username,
        email,
        password,
        roleId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/users");
  } catch (error) {
    console.log("ERREUR CREATE USER =", error.response?.data || error.message);

    res.render("users/create", {
      title: "Ajouter un utilisateur",
      error:
        error.response?.data?.message ||
        "Erreur lors de l'ajout de l'utilisateur.",
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

    console.log("REPONSE API USER BY ID =", response.data);

    const user =
      response.data.user ||
      response.data.data ||
      response.data;

    res.render("users/edit", {
      title: "Modifier un utilisateur",
      user,
      error: null,
    });
  } catch (error) {
    console.log("ERREUR SHOW EDIT USER =", error.response?.data || error.message);
    res.redirect("/users");
  }
};

exports.update = async (req, res) => {
  try {
    const token = req.session.user.token;
    const { id } = req.params;
    const { username, email, roleId } = req.body;

    await axios.put(
      `${API_BASE_URL}/${id}`,
      {
        username,
        email,
        roleId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.redirect("/users");
  } catch (error) {
    console.log("ERREUR UPDATE USER =", error.response?.data || error.message);

    res.render("users/edit", {
      title: "Modifier un utilisateur",
      user: {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email,
        roleId: req.body.roleId,
      },
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

    res.redirect("/users");
  } catch (error) {
    console.log("ERREUR DELETE USER =", error.response?.data || error.message);
    res.redirect("/users");
  }
};