const usersCollection = require("../db").collection("users");
const validator = require("validator");
const bcrypt = require("bcryptjs");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.login = async function () {
  return new Promise(async (resolve, reject) => {
    let loginuser = await usersCollection.findOne({
      username: this.data.username,
    });

    if (
      loginuser &&
      bcrypt.compareSync(this.data.password, loginuser.password)
    ) {
      console.log("🚀 ~ loginuser:", loginuser);
      this._id = loginuser._id;
      resolve("Congratulations! Login success!");
    } else {
      reject("Invalid username or password...");
    }
  });
};

// User.prototype.login = async function (callback) {
//   let loginuser = await usersCollection.findOne({
//     username: this.data.username,
//   });

//   if (loginuser && loginuser.password == this.data.password) {
//     callback("Login success!");
//   } else {
//     callback("Login failed...");
//   }
// };

User.prototype.validate = async function () {
  return new Promise(async (resolve, reject) => {
    if (!this.data.username) this.errors.push("Та нэрээ бичнэ үү");
    if (this.data.username && !validator.isAlphanumeric(this.data.username))
      this.errors.push("Нэр зөвхөн үсэг тооноос тогтож болно");
    if (!this.data.email) this.errors.push("Та имэйлээ бичнэ үү");
    if (this.data.email && !validator.isEmail(this.data.email))
      this.errors.push("Таны имэйл буруу байна");
    if (!this.data.password) this.errors.push("Та нууц үгээ бичнэ үү");

    if (
      this.data.username.length > 0 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let sameUser = await usersCollection.findOne({
        username: this.data.username,
      });
      if (sameUser) this.errors.push("Таны оруулсан нэр бүртгэлтэй байна");
    }

    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email,
      });
      if (emailExists) this.errors.push("Таны оруулсан имэйл бүртгэлтэй байна");
    }
    resolve();
  });
};

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    await this.validate();
    if (!this.errors.length) {
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      let info = await usersCollection.insertOne(this.data);  // Capture info
      this._id = info.insertedId;  // Set on instance
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject();
      return;
    }
    usersCollection
      .findOne({ username })
      .then(function (userDoc) {
        if (userDoc) {
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function () {
        reject();
      });
  });
};

module.exports = User;
