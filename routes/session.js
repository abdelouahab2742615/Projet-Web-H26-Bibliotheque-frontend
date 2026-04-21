const express = require("express");

const router = express.Router();

function sanitizeRedirect(target) {
  return target && typeof target === "string" && target.startsWith("/") ? target : "/session";
}

router.get("/", (req, res) => {
  res.render("session", {
    title: "Jeton API",
    hasSessionToken: Boolean(req.session.authToken),
    hasEnvironmentToken: Boolean(process.env.DEFAULT_AUTH_TOKEN),
  });
});

router.post("/token", (req, res) => {
  const token = req.body.authToken?.trim();
  const redirectTo = sanitizeRedirect(req.body.redirectTo);

  if (token) {
    req.session.authToken = token;
    req.session.flash = {
      type: "success",
      message: "Jeton JWT enregistre dans la session.",
    };
  } else {
    delete req.session.authToken;
    req.session.flash = {
      type: "warning",
      message: "Aucun jeton fourni. La session a ete videe.",
    };
  }

  res.redirect(redirectTo);
});

router.post("/token/clear", (req, res) => {
  delete req.session.authToken;
  req.session.flash = {
    type: "success",
    message: "Jeton de session supprime.",
  };
  res.redirect(sanitizeRedirect(req.body.redirectTo));
});

module.exports = router;
