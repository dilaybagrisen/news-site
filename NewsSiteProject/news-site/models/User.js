const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); //bcryptjs → Kullanıcı şifrelerini güvenli hale getirmek (şifrelemek) için kullanılır.Bcrypt, şifreleri okunamaz hale getiren bir kilit mekanizması gibi. (Kimse başkasının şifresini düz metin olarak görmemeli!)

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "writer", "reader"], required: true },
});

// Şifreyi kaydetmeden önce hashle
UserSchema.pre("save", async function (next) {
  //pre("save"), kaydetme işlemi başlamadan önce bu kodu çalıştır demek.
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10); //Salt, şifreye eklenen ekstra bir güvenlik katmanıdır.
  this.password = await bcrypt.hash(this.password, salt); //şifreyi okunmaz hale getirir.
  next();
});

module.exports = mongoose.model("User", UserSchema);
