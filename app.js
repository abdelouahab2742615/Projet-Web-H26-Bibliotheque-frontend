const path = require("path");
const express = require("express");
const path = require("path");
const session = require("express-session");

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "frontend_bibliotheque_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

const webRoutes = require("./routes/web");
app.use("/", webRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Frontend lancé sur http://localhost:${PORT}`);
});
