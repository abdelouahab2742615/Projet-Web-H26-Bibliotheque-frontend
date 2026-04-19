const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleware");
const categoryController = require("../controllers/categoryController");
const bookController = require("../controllers/bookController");



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


// Categories
router.get("/categories", authMiddleware, categoryController.index);
router.get("/categories/create", authMiddleware, categoryController.showCreate);
router.post("/categories/create", authMiddleware, categoryController.create);
router.get("/categories/edit/:id", authMiddleware, categoryController.showEdit);
router.post("/categories/edit/:id", authMiddleware, categoryController.update);
router.post("/categories/delete/:id", authMiddleware, categoryController.delete);

// Books
router.get("/books", authMiddleware, bookController.index);
router.get("/books/create", authMiddleware, bookController.showCreate);
router.post("/books/create", authMiddleware, bookController.create);
router.post("/books/delete/:id", authMiddleware, bookController.delete);


module.exports = router;