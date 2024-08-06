require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const CommerceType = require("../models/commerceType");
const { validationResult } = require("express-validator");
const transporter = require("../services/sendEmail");
const Token = require("../models/userToken");
const crypto = require("crypto");
const exp = require("constants");
function getLogin(req, res) {
  res.render("auth/login", {
    title: "Login - Gourmet Dinning",
    page: "login",
  });
}

async function postLogin(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/login");
  }

  const { email, password } = req.body;
  let user = await User.findOne({ where: { email } });
  user = user.dataValues;
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/login");
  }

  if (!user.isActive) {
    req.flash("error", "User not verified");
    return res.redirect("/login");
  }

  req.session.user = user;
  req.flash("success", "Welcome");

  const roleRoutes = {
    admin: "/admin",
    user: "/customer",
    commerce: "/commerce",
    delivery: "/delivery",
  };

  const redirectUrl = roleRoutes[user.role] || "/login";
  console.log(redirectUrl);
  return res.redirect(redirectUrl); // Ensure this line performs the redirection
}

function getRegister(req, res) {
  res.render("auth/registerCustumerDelivery"),
    {
      title: "Register - Gourmet Dinning",
      page: "register",
    };
}

async function getRegisterCommerce(req, res) {
  let commerceTypes = await CommerceType.findAll();
  commerceTypes = commerceTypes.map((type) => type.dataValues);
  res.render("auth/registerCommerce", {
    commerceTypes,
  }),
    {
      title: "Register - Gourmet Dinning",
      page: "register",
    };
}

async function emailActivation(email, req) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/register");
  }
  const token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
    expireAt: Date.now() + 3600000,
    purpose: "emailActivation",
  });

  await token.save();

  const mailOptions = {
    from: process.env.EmailUser,
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
  res.render("auth/newPass"),
    {
      page: "newPass",
      title: "Reset Password - Gourmet Dinning",
    };
}

async function resetPasswordToken(req, res) {
  const { email } = req.body;
  console.log(email);
  await emailResetPassword(email, req);
  res.redirect("/login");
}

//Reset password page
async function getnewPassword(req, res) {
  
  const token = await Token.findOne({ where: { token: req.params.token } });
  if (!token) {
    req.flash("error", "Token not found");
    return res.redirect("auth/newPass");
  }
  if (token.expireAt < Date.now()) {
    req.flash("error", "Token expired");
    return res.redirect("auth/newPass");
  }

  if (token.purpose !== "resetPassword") {
    req.flash("error", "Invalid token");
    return res.redirect("auth/newPass");
  }

  res.render("auth/confirmNewPass", {
    title: "Reset Password - Gourmet Dinning",
    token: req.params.token,
  });
}

//Reset password
async function resetPassword(req, res) {
  const { password, confirmPassword } = req.body;
  const token = await Token.findOne({ where: { token: req.params.token } });
  if (!token) {
    req.flash("error", "Token not found");
    return res.redirect("auth/newPass");
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
  await user.save();
  await token.destroy();
  req.flash("success", "Password updated");
  res.redirect("/login");
}

//Send email to reset password
async function emailResetPassword(email, req) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.flash("error", "User not found");
    res.render("auth/newPass"),
      {
        page: "newPass",
        title: "Reset Password - Gourmet Dinning",
      };
  }
  if (user.isVerified === false) {
    req.flash("error", "User not verified");
    res.render("auth/newPass"),
      {
        page: "newPass",
        title: "Reset Password - Gourmet Dinning",
      };
  }

  if (user.role === "admin") {
    req.flash("error", "Admin cannot reset password");
    res.render("auth/newPass"),
      {
        page: "newPass",
        title: "Reset Password - Gourmet Dinning",
      };
  }

  const token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
    purpose: "resetPassword",
    expireAt: Date.now() + 3600000,
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
  res.render("auth/activationpage");
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
    return res.redirect("/registerclient");
  }

  const picture = file.path.replace(/^public/, "");
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/registerclient");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);

  const response = await userValidation(email, username);
  if (response) {
    req.flash("error", response);
    return res.redirect("/registerclient");
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

  await user
    .save()
    .then(async (result) => {})
    .catch((err) => {
      console.log(err);
      req.flash("error", "Internal server error");
      res.redirect("/registerclient");
    });

  await emailActivation(email, req);
  res.redirect("/login");
}

async function postRegisterCommerceCliente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/registercommerce");
  }
  const {
    phone,
    email,
    username,
    password,
    confirmPassword,
    openingTime,
    closingTime,
    commerceType,
  } = req.body;

  const file = req.file;
  if (!file) {
    req.flash("error", "Please upload a file");
    return res.redirect("/registercommerce");
  }

  let commerceTypedata = await CommerceType.findOne({
    where: { name: commerceType },
  });
  if (!commerceType) {
    req.flash("error", "Commerce type not found");
    return res.redirect("/registercommerce");
  }

  const picture = file.path.replace(/^public/, "");
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/registercommerce");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);
  const response = await userValidation(email, username);
  if (response) {
    req.flash("error", response);
    return res.redirect("/registercommerce");
  }
  const user = new User({
    phone,
    email,
    username,
    role: "commerce",
    password: hashedPassword,
    picture,
    openingTime,
    closingTime,
    commerceType,
  });

  await user
    .save()
    .then(async (result) => {})
    .catch((err) => {
      console.log(err);
      req.flash("error", "Internal server error");
      res.redirect("/registercommerce");
    });
  await emailActivation(email, req);

  res.redirect("/login");
}

function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

async function userValidation(email, username) {
  const userByEmail = await User.findOne({ where: { email } });
  console.log(userByEmail);
  if (userByEmail) {
    return "Email already exists";
  }

  const userByUsername = await User.findOne({ where: { username } });
  if (userByUsername) {
    return "Username already exists";
  }

  return Promise.resolve();
}
//Page to activate account
async function getactivationpage(req, res) {
  const tokenconfirmation = req.params.token;
  const token = await Token.findOne({ where: { token: tokenconfirmation } });
  if (!token) {
    req.flash("error", "Token not found");
    return res.render("auth/mailActivationError");
  }
  if (token.expireAt < Date.now()) {
    req.flash("error", "Token expired");
    return res.render("auth/mailActivationError");
  }
  if (token.purpose !== "emailActivation") {
    req.flash("error", "Invalid token");
    return res.render("auth/mailActivationError");
  }
  const user = await User.findOne({ where: { id: token.userId } });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }
  user.isActive = true;
  await user.save();
  await token.destroy();
  req.flash("success", "Account verified");
  res.render("auth/activationpage", {
    title: "Activation - Gourmet Dinning",
  });
}

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  getRegisterCommerce,
  postRegisterClientOrDelivery,
  postRegisterCommerceCliente,
  logout,
  confirmation,
  getResetPassword,
  getactivationpage,
  resetPasswordToken,
  getnewPassword,
  resetPassword,
};
