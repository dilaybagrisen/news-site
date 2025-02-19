// middleware/authMiddleware.js
module.exports = {
  ensureAuthenticated: (req, res, next) => {
    //ensureAuthenticated → Kullanıcının giriş yapıp yapmadığını kontrol ediyor
    console.log(
      "🔥 ensureAuthenticated Middleware çalıştı! req.user:",
      req.user
    );
    if (req.isAuthenticated()) {
      console.log("✅ Kullanıcı oturum açmış:", req.user);
      return next();
    }
    console.log("❌ Kullanıcı oturum açmamış!");
    res.status(401).send("Yetkisiz erişim! Giriş yapmalısınız.");
  },

  ensureRole: (roles) => {
    //ensureRole → Kullanıcının yetkili olup olmadığını kontrol eder.
    return (req, res, next) => {
      console.log("Rol kontrol middleware'i çalıştı. Kullanıcı:", req.user);
      if (!req.isAuthenticated()) {
        return res.status(401).send("Yetkisiz erişim! Giriş yapmalısınız.");
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).send("Erişim reddedildi! Yetkiniz yok.");
      }
      console.log("Kullanıcının yetkisi uygun:", req.user.role);
      next(); //Eğer giriş yapmış ve yetkiliyse, next() ile devam etmesine izin verir.
    };
  },
};
