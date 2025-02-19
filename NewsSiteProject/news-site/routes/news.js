const express = require("express");
const router = express.Router();
const News = require("../models/News");
const {
  ensureAuthenticated,
  ensureRole,
} = require("../middleware/authMiddleware");

//  1. Tüm Haberleri Görüntüleme (Herkes erişebilir)
//  Güncellenmiş `/news` route'u (EJS ile haberleri gösterir)
router.get("/", async (req, res) => {
  try {
    const news = await News.find().populate("author", "username role");
    res.render("news", { news, user: req.user || null }); // ✅ user değişkenini ekledik
  } catch (err) {
    res.status(500).send("Haberleri getirirken hata oluştu.");
  }
});

// ✅ Yeni Haber Ekleme Sayfasını Aç (Sadece Admin ve Writer)
router.get(
  "/add",
  ensureAuthenticated,
  ensureRole(["admin", "writer"]),
  (req, res) => {
    res.render("add-news");
  }
);

// ✅ Yeni Haber Ekleme İşlemi (Sadece Admin ve Writer)
router.post(
  "/add",
  ensureAuthenticated,
  ensureRole(["admin", "writer"]),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const newNews = new News({ title, content, author: req.user._id });
      await newNews.save();
      res.redirect("/news");
    } catch (err) {
      res.status(500).send("Haber eklerken hata oluştu.");
    }
  }
);

// ✅ Haberi Düzenleme Sayfasını Aç (Sadece Admin ve Writer)
router.get(
  "/edit/:id",
  ensureAuthenticated,
  ensureRole(["admin", "writer"]),
  async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      res.render("edit-news", { news });
    } catch (err) {
      res.status(500).send("Haberi getirirken hata oluştu.");
    }
  }
);

// ✅ Haberi Güncelleme (Sadece Admin ve Writer)
router.post(
  "/edit/:id",
  ensureAuthenticated,
  ensureRole(["admin", "writer"]),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      await News.findByIdAndUpdate(req.params.id, { title, content });
      res.redirect("/news");
    } catch (err) {
      res.status(500).send("Haberi güncellerken hata oluştu.");
    }
  }
);

// ✅ Haberi Silme (Sadece Admin)
router.get(
  "/delete/:id",
  ensureAuthenticated,
  ensureRole(["admin"]),
  async (req, res) => {
    try {
      await News.findByIdAndDelete(req.params.id);
      res.redirect("/news");
    } catch (err) {
      res.status(500).send("Haberi silerken hata oluştu.");
    }
  }
);

module.exports = router;
