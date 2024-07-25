const User = require("../models/user");
const bcrypt = require("bcryptjs");
const CommerceType = require("../models/commerceType");
const { validationResult } = require("express-validator");
const transporter = require("../services/sendEmail");
const Token = require("../models/userToken");
function getLogin(req, res) {
  res.render("auth/login");
}

function postLogin(req, res) {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/login");
  }

  const { email, password } = req.body;

  User.findOne({ where: { email } })
    .then((result) => {
      if (!result) {
        req.flash("error", "User not found");
        res.redirect("/login");
      }
      if(result.isVerified === false){
        req.flash("error", "User not verified");
        return res.redirect("/login");
        }
      const isMatch = bcrypt.compareSync(password, result.password);
      if (!isMatch) {
        req.flash("error", "Invalid credentials");
        res.redirect("/login");
      }
      req.session.user = result;
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Internal server error");
      res.redirect("/login");
    });
}

function getRegister(req, res) {
  res.render("auth/register");
}

async function emailActivation(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/register");
  }
  const token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
    purpose: "emailActivation",
  });
  token.save();

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Account Verification Token",
    text:
      "Hello,\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      req.headers.host +
      "/confirmation/" +
      token.token +
      ".\n",
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  req.flash(
    "success",
    "A verification email has been sent to " + user.email + "."
  );
}
//Reset password page
async function getResetPassword(req, res) {
  res.render("auth/resetPassword");
}
//Reset password
async function resetPassword(req, res) {
  const { password, confirmPassword } = req.body;
  const token = await Token.findOne({ where: { token: req.params.token } });
  if (!token) {
    req.flash("error", "Token not found");
    return res.redirect("auth/resetPassword");
  }

  if (token.expireAt < Date.now()) {
    req.flash("error", "Token expired");
    res.redirect("/register");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/register");
  }

  const user = await User.findOne({ where: { id: token.userId } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/register");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);
  user.password = hashedPassword;
  user.save();
  token.remove();
  req.flash("success", "Password updated");
  res.redirect("/login");
}
//Send email to reset password
async function emailResetPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/register");
  }
  if (user.isVerified === false) {
    req.flash("error", "User not verified");
    return res.redirect("/register");
  }

  if (user.role === "admin") {
    req.flash("error", "Admin cannot reset password");
    return res.redirect("/register");
  }

  const token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
    purpose: "resetPassword",
  });
  token.save();

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Account Verification Token",
    text:
      "Hello,\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      req.headers.host +
      "/resetPassword/" +
      token.token +
      ".\n",
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  req.flash(
    "success",
    "A verification email has been sent to " + user.email + "."
  );
}

async function confirmation(req, res) {
  const token = await Token.findOne({ where: { token: req.params.token } });
  if (!token) {
    req.flash("error", "Token not found");
    return res.redirect("/register");
  }

  if (token.expireAt < Date.now()) {
    req.flash("error", "Token expired");
  }

  const user = await User.findOne({ where: { id: token.userId } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/register");
  }
  user.isVerified = true;
  user.save();
  token.remove();
  req.flash("success", "Account verified");
  res.redirect("/login");
}

//Register For client or delivery
async function postRegisterClientOrDelivery(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/register");
  }
  const {
    name,
    lastName,
    phone,
    email,
    username,
    role,
    password,
    confirmPassword,
  } = req.body;

  const file = req.file;

  if (!file) {
    req.flash("error", "Please upload a file");
    return res.redirect("/register");
  }
  const picture = file.path.replace(/^public/, "");
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/register");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);

  const response = await userValidation(email, username);
  if (response) {
    req.flash("error", response);
    return res.redirect("/register");
  }

  const user = new User({
    name,
    lastName,
    phone,
    email,
    username,
    role,
    password: hashedPassword,
    picture,
  });

  user
    .save()
    .then(async (result) => {
      await emailActivation(email);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Internal server error");
      res.redirect("/register");
    });
}

async function postRegisterCommerceCliente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/register");
  }
  const {
    name,
    lastName,
    phone,
    email,
    username,
    role,
    password,
    confirmPassword,
    openingTime,
    closingTime,
    commerceType,
  } = req.body;

  const file = req.file;
  if (!file) {
    req.flash("error", "Please upload a file");
    return res.redirect("/register");
  }

  commerceType = await CommerceType.findOne({ where: { name: commerceType } });
  if (!commerceType) {
    req.flash("error", "Commerce type not found");
    return res.redirect("/register");
  }

  const picture = file.path.replace(/^public/, "");
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/register");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);
  const response = await userValidation(email, username);
  if (response) {
    req.flash("error", response);
    return res.redirect("/register");
  }
  const user = new User({
    name,
    lastName,
    phone,
    email,
    username,
    role,
    password: hashedPassword,
    picture,
    openingTime,
    closingTime,
    commerceType,
  });
  user
    .save()
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Internal server error");
      res.redirect("/register");
    });
}

function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

function userValidation(email, username) {
  const userByEmail = User.findOne({ where: { email } });
  if (userByEmail) {
    return Promise.reject("Email already exists");
  }

  const userByUsername = User.findOne({ where: { username } });
  if (userByUsername) {
    return Promise.reject("Username already exists");
  }

  return Promise.resolve();
}

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegisterClientOrDelivery,
  postRegisterCommerceCliente,
  logout,
  confirmation,
};
