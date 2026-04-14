const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

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