const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// ✅ Tarayıcıdan login formunu göstermek için GET endpoint'i ekledik!
router.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Kullanıcı Kayıt (Register)
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.send("Lütfen tüm alanları doldurun!");
  }

  // Kullanıcı adı kontrolü
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.send("Bu kullanıcı adı zaten alınmış!");
  }

  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.send("Kullanıcı başarıyla kaydedildi!");
  } catch (err) {
    res.send("Kullanıcı eklerken hata oluştu!");
  }
});

// ✅ Kullanıcı Girişi (Login) - Hem API'den hem de tarayıcıdan çalışır!
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.send("Giriş başarısız!");

    req.logIn(user, (err) => {
      if (err) return next(err);

      // 📌 Eğer tarayıcıdan giriş yapıyorsa yönlendir!
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/news"); // ✅ Tarayıcıdan giriş yapanlar /news sayfasına yönlendirilecek!
      }

      res.send(`Giriş başarılı! Hoş geldin, ${user.username}!`);
    });
  })(req, res, next);
});

// ✅ Kullanıcı Çıkışı (Logout)
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.send("Çıkışta hata oluştu!");

    // 📌 Eğer tarayıcıdan çıkış yapıyorsa, login sayfasına yönlendir
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/auth/login");
    }

    res.send("Başarıyla çıkış yapıldı!");
  });
});

module.exports = router;
