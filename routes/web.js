const axios = require("axios");

const LOGIN_API = "http://localhost:3000/api/users/login";

exports.showLogin = (req, res) => {
  res.render("login", {
    title: "Connexion",
    error: null,
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", {
        title: "Connexion",
        error: "Veuillez remplir tous les champs.",
      });
    }

    const response = await axios.post(LOGIN_API, {
      email,
      password,
    });

    const token = response.data.token;
    const user = response.data.user;

    if (!token || !user) {
      return res.render("login", {
        title: "Connexion",
        error: "Réponse invalide du serveur.",
      });
    }

    req.session.user = {
      token,
      user,
    };

    res.redirect("/dashboard");
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Email ou mot de passe incorrect.";

    res.render("login", {
      title: "Connexion",
      error: message,
    });
  }
};

exports.dashboard = (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    currentUser: req.session.user,
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};