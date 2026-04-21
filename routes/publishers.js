const express = require("express");
const {
  buildPublisherPayload,
  createItem,
  deleteItem,
  extractItems,
  getCollection,
  getItemById,
  normalizePublisher,
  updateItem,
} = require("../lib/backend-api");

const router = express.Router();

function buildPublisherValues(source = {}) {
  return {
    nom: source.nom || "",
    pays: source.pays || "",
    telephone: source.telephone || "",
  };
}

function validatePublisher(values) {
  const errors = {};

  if (!values.nom.trim()) {
    errors.nom = "Le nom de l'editeur est obligatoire.";
  }

  if (values.telephone && !/^[0-9+()\-\s]{7,20}$/.test(values.telephone)) {
    errors.telephone = "Le telephone doit contenir entre 7 et 20 caracteres valides.";
  }

  return errors;
}

function renderPublisherForm(res, view, locals) {
  const hasErrors = locals.formError || Object.keys(locals.errors).length > 0;
  res.status(hasErrors ? 400 : 200).render(view, locals);
}

router.get("/", async (req, res) => {
  let publishers = [];
  let pageError = null;

  try {
    const payload = await getCollection("publishers", { query: { limit: 100 } });
    publishers = extractItems(payload).map(normalizePublisher);
  } catch (error) {
    pageError = error.message;
  }

  res.render("publishers/index", {
    title: "Editeurs",
    publishers,
    pageError,
  });
});

router.get("/create", (req, res) => {
  renderPublisherForm(res, "publishers/create", {
    title: "Ajouter un editeur",
    values: buildPublisherValues(),
    errors: {},
    formError: null,
  });
});

router.post("/create", async (req, res) => {
  const values = buildPublisherValues(req.body);
  const errors = validatePublisher(values);

  if (Object.keys(errors).length > 0) {
    return renderPublisherForm(res, "publishers/create", {
      title: "Ajouter un editeur",
      values,
      errors,
      formError: null,
    });
  }

  try {
    await createItem("publishers", buildPublisherPayload(values));
    req.session.flash = {
      type: "success",
      message: "Editeur ajoute avec succes.",
    };
    res.redirect("/publishers");
  } catch (error) {
    renderPublisherForm(res, "publishers/create", {
      title: "Ajouter un editeur",
      values,
      errors: {},
      formError: error.message,
    });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const publisher = await getItemById("publishers", req.params.id);

    renderPublisherForm(res, "publishers/edit", {
      title: "Modifier un editeur",
      values: buildPublisherValues(normalizePublisher(publisher)),
      errors: {},
      formError: null,
      publisherId: req.params.id,
    });
  } catch (error) {
    req.session.flash = {
      type: "error",
      message: error.message,
    };
    res.redirect("/publishers");
  }
});

router.post("/:id/edit", async (req, res) => {
  const values = buildPublisherValues(req.body);
  const errors = validatePublisher(values);

  if (Object.keys(errors).length > 0) {
    return renderPublisherForm(res, "publishers/edit", {
      title: "Modifier un editeur",
      values,
      errors,
      formError: null,
      publisherId: req.params.id,
    });
  }

  try {
    await updateItem("publishers", req.params.id, buildPublisherPayload(values));
    req.session.flash = {
      type: "success",
      message: "Editeur mis a jour avec succes.",
    };
    res.redirect("/publishers");
  } catch (error) {
    renderPublisherForm(res, "publishers/edit", {
      title: "Modifier un editeur",
      values,
      errors: {},
      formError: error.message,
      publisherId: req.params.id,
    });
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    await deleteItem("publishers", req.params.id);
    req.session.flash = {
      type: "success",
      message: "Editeur supprime avec succes.",
    };
  } catch (error) {
    req.session.flash = {
      type: "error",
      message: error.message,
    };
  }

  res.redirect("/publishers");
});

module.exports = router;
