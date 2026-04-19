const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleware");
const categoryController = require("../controllers/categoryController");
const bookController = require("../controllers/bookController");
const authorController = require("../controllers/authorController");
const borrowingController = require("../controllers/borrowingController");
const reservationController = require("../controllers/reservationController");
const reviewController = require("../controllers/reviewController");

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.get("/dashboard", authMiddleware, authController.dashboard);
router.get("/logout", authController.logout);

// Users CRUD
router.get("/users", authMiddleware, userController.index);
router.get("/users/create", authMiddleware, userController.showCreate);
router.post("/users/create", authMiddleware, userController.create);
router.get("/users/edit/:id", authMiddleware, userController.showEdit);
router.post("/users/edit/:id", authMiddleware, userController.update);
router.post("/users/delete/:id", authMiddleware, userController.delete);

// Roles CRUD
router.get("/roles", authMiddleware, roleController.index);
router.get("/roles/create", authMiddleware, roleController.showCreate);
router.post("/roles/create", authMiddleware, roleController.create);
router.get("/roles/edit/:id", authMiddleware, roleController.showEdit);
router.post("/roles/edit/:id", authMiddleware, roleController.update);
router.post("/roles/delete/:id", authMiddleware, roleController.delete);

// Categories CRUD
router.get("/categories", authMiddleware, categoryController.index);
router.get("/categories/create", authMiddleware, categoryController.showCreate);
router.post("/categories/create", authMiddleware, categoryController.create);
router.get("/categories/edit/:id", authMiddleware, categoryController.showEdit);
router.post("/categories/edit/:id", authMiddleware, categoryController.update);
router.post("/categories/delete/:id", authMiddleware, categoryController.delete);

// Books CRUD
router.get("/books", authMiddleware, bookController.index);
router.get("/books/create", authMiddleware, bookController.showCreate);
router.post("/books/create", authMiddleware, bookController.create);
router.get("/books/edit/:id", authMiddleware, bookController.showEdit);
router.post("/books/edit/:id", authMiddleware, bookController.update);
router.post("/books/delete/:id", authMiddleware, bookController.delete);

// Authors CRUD
router.get("/authors", authMiddleware, authorController.index);
router.get("/authors/create", authMiddleware, authorController.showCreate);
router.post("/authors/create", authMiddleware, authorController.create);
router.get("/authors/edit/:id", authMiddleware, authorController.showEdit);
router.post("/authors/edit/:id", authMiddleware, authorController.update);
router.post("/authors/delete/:id", authMiddleware, authorController.delete);

// Borrowings CRUD
router.get("/borrowings", authMiddleware, borrowingController.index);
router.get("/borrowings/create", authMiddleware, borrowingController.showCreate);
router.post("/borrowings/create", authMiddleware, borrowingController.create);
router.get("/borrowings/edit/:id", authMiddleware, borrowingController.showEdit);
router.post("/borrowings/edit/:id", authMiddleware, borrowingController.update);
router.post("/borrowings/delete/:id", authMiddleware, borrowingController.delete);

// Reservations CRUD
router.get("/reservations", authMiddleware, reservationController.index);
router.get("/reservations/create", authMiddleware, reservationController.showCreate);
router.post("/reservations/create", authMiddleware, reservationController.create);
router.get("/reservations/edit/:id", authMiddleware, reservationController.showEdit);
router.post("/reservations/edit/:id", authMiddleware, reservationController.update);
router.post("/reservations/delete/:id", authMiddleware, reservationController.delete);

// Reviews CRUD
router.get("/reviews", authMiddleware, reviewController.index);
router.get("/reviews/create", authMiddleware, reviewController.showCreate);
router.post("/reviews/create", authMiddleware, reviewController.create);
router.get("/reviews/edit/:id", authMiddleware, reviewController.showEdit);
router.post("/reviews/edit/:id", authMiddleware, reviewController.update);
router.post("/reviews/delete/:id", authMiddleware, reviewController.delete);

module.exports = router;