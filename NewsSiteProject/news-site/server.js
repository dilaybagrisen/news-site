const express = require("express");
const session = require("express-session");
const passport = require("passport");
const userRoutes = require("./routes/users");
//const MongoStore = require("connect-mongo");

require("./config/passport"); // Passport yapılandırmasını içe aktarıyoruz

// Passport modülü bir kez yüklendiğinde (require("./config/passport")), Passport server.js içinde passport.initialize() ve passport.session() fonksiyonlarının çalışmasını sağlıyor.

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");

const newsRoutes = require("./routes/news");

const app = express();

// MongoDB bağlantısını başlat
connectDB();

// Middleware'ler
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Session Middleware (Passport'tan önce olmalı)
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Middleware (session'dan sonra gelmeli!)
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("🔥 Gelen Çerezler:", req.headers.cookie);
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user; // Tüm sayfalara user bilgisini gönder
  next();
});

// Auth route'larını kullan
app.use("/auth", authRoutes);

app.use("/news", newsRoutes); //Bu satır, haberlerle ilgili istekleri /news route'una yönlendirir.
app.use("/users", userRoutes);
// Ana sayfa yönlendirme
app.get("/", (req, res) => {
  res.render("login");
});

//Şimdi EJS'yi kullanabilmek için server.js içinde view engine ayarlarını ekledik.

app.set("view engine", "ejs"); // EJS'yi kullanacağımızı belirtiyoruz
app.set("views", __dirname + "/views"); // `views` klasörünü ayarlıyoruz

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor! 🚀`));
