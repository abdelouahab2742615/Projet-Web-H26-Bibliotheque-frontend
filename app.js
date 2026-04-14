const path = require("path");
const express = require("express");
const session = require("express-session");

const publisherRoutes = require("./routes/publishers");
const reservationRoutes = require("./routes/reservations");
const sessionRoutes = require("./routes/session");
const { apiConfig, getCollection, extractItems } = require("./lib/backend-api");

const app = express();
const port = Number(process.env.PORT) || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bibliotheque-frontend-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  }),
);

app.use((req, res, next) => {
  const hasSessionToken = Boolean(req.session.authToken);
  const hasEnvToken = Boolean(process.env.DEFAULT_AUTH_TOKEN);

  res.locals.currentPath = req.path;
  res.locals.backendUrl = apiConfig.backendUrl;
  res.locals.hasAuthToken = hasSessionToken || hasEnvToken;
  res.locals.authTokenSource = hasSessionToken ? "session" : hasEnvToken ? "environment" : "none";
  res.locals.flash = req.session.flash || null;
  res.locals.currentYear = new Date().getFullYear();

  delete req.session.flash;
  next();
});

app.get("/", async (req, res) => {
  const token = req.session.authToken || process.env.DEFAULT_AUTH_TOKEN || "";

  const stats = {
    publishers: null,
    reservations: null,
  };

  const warnings = [];

  try {
    const publishersPayload = await getCollection("publishers", { query: { limit: 100 } });
    stats.publishers = extractItems(publishersPayload).length;
  } catch (error) {
    warnings.push("Impossible de recuperer les editeurs depuis le backend.");
  }

  try {
    const reservationsPayload = await getCollection("reservations", {
      token,
      query: { limit: 100 },
    });
    stats.reservations = extractItems(reservationsPayload).length;
  } catch (error) {
    warnings.push(
      error.status === 401 || error.status === 403
        ? "Les reservations necessitent un jeton JWT valide."
        : "Impossible de recuperer les reservations depuis le backend.",
    );
  }

  res.render("index", {
    title: "Bibliotheque Frontend",
    stats,
    warnings,
  });
});

app.use("/session", sessionRoutes);
app.use("/publishers", publisherRoutes);
app.use("/reservations", reservationRoutes);

app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page introuvable",
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Frontend lance sur http://localhost:${port}`);
    console.log(`Backend cible: ${apiConfig.backendUrl}`);
  });
}

module.exports = app;
