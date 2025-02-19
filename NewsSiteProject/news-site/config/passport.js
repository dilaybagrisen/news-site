const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    //username ile MongoDB içinde kullanıcı aranır. Kullanıcı yoksa hata döndürülür.Varsa, bcrypt.compare() ile şifre doğrulanır.Şifre yanlışsa hata döndürülür.Şifre doğruysa kullanıcı oturuma alınır.
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Kullanıcı bulunamadı!" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Şifre yanlış!" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("✅ serializeUser çalıştı! Kullanıcı ID kaydediliyor:", user.id);
  //Kullanıcı giriş yaptığında user.id saklanır.Bu, oturum açmış kullanıcıyı takip etmek için kullanılır.
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  //Tarayıcıda oturum devam ettiği sürece, her istekte kullanıcı veritabanından çekilir.Kullanıcının ID'si oturumda saklandığı için, User.findById(id) ile tekrar bulunur.
  try {
    console.log("🔄 deserializeUser çalışıyor! Kullanıcı ID:", id);
    const user = await User.findById(id);
    console.log("✅ deserializeUser Kullanıcı bulundu:", user);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
