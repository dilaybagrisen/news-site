const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  ensureAuthenticated,
  ensureRole,
} = require("../middleware/authMiddleware");

// ✅ Kullanıcı Yönetim Sayfasını Göster (Sadece Admin)
router.get(
  "/",
  ensureAuthenticated,
  ensureRole(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find(); // Tüm kullanıcıları getir
      res.render("manage-users", { users, user: req.user });
    } catch (err) {
      res.status(500).send("Kullanıcıları getirirken hata oluştu.");
    }
  }
);

// ✅ Yeni Kullanıcı Ekleme (Sadece Admin)
router.post(
  "/add",
  ensureAuthenticated,
  ensureRole(["admin"]),
  async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.send("Lütfen tüm alanları doldurun!");
    }

    try {
      const newUser = new User({ username, password, role });
      await newUser.save();
      res.redirect("/users");
    } catch (err) {
      res.send("Kullanıcı eklerken hata oluştu!");
    }
  }
);

// ✅ Kullanıcı Güncelleme (Admin kendi adını değiştirebilir, diğer kullanıcıları düzenleyebilir)
router.post(
  "/update/:id",
  ensureAuthenticated,
  ensureRole(["admin"]),
  async (req, res) => {
    try {
      const { newUsername, newRole } = req.body;
      if (!newUsername) {
        return res.send("Kullanıcı adı boş olamaz!");
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.send("Kullanıcı bulunamadı!");
      }

      // Eğer admin kendi hesabını düzenliyorsa sadece adını değiştirebilir
      if (user.role === "admin" && user.id === req.user.id) {
        await User.findByIdAndUpdate(req.params.id, { username: newUsername });
      }
      // Eğer admin başka bir kullanıcıyı düzenliyorsa rolünü değiştirebilir
      else if (user.role !== "admin") {
        await User.findByIdAndUpdate(req.params.id, {
          username: newUsername,
          role: newRole,
        });
      }

      res.redirect("/users");
    } catch (err) {
      res.status(500).send("Kullanıcı güncellenirken hata oluştu.");
    }
  }
);

// ✅ Kullanıcı Silme (Admin, admin hariç herkesin hesabını silebilir)
router.post(
  "/delete/:id",
  ensureAuthenticated,
  ensureRole(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.send("Kullanıcı bulunamadı!");
      }

      if (user.role === "admin") {
        return res.send("Admini silemezsiniz!");
      }

      await User.findByIdAndDelete(req.params.id);
      res.redirect("/users");
    } catch (err) {
      res.status(500).send("Kullanıcı silinirken hata oluştu.");
    }
  }
);

module.exports = router;
