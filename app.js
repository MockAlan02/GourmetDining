require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const { engine } = require("express-handlebars");
const connection = require("./contexts/AppContext");
const flash = require("connect-flash");
const session = require("express-session");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { authorizeRole, isAuth, isNotAuth } = require("./middlewares/is-auth");

const port = process.env.PORT || 3000;

const hbs = require("handlebars");

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  if (Array.isArray(arg2)) {
    if (arg2.includes(arg1)) {
      return options.fn(this);
    }
  } else {
    if (arg1 === arg2) {
      return options.fn(this);
    }
  }
  return options.inverse(this);
});

app.engine(
  "hbs",
  engine({
    layoutsDir: path.join(__dirname, "views/layouts/"),
    defaultLayout: "main",
    extname: "hbs",
    helpers: {
      ifEquals: function (arg1, arg2, options) {
        if (Array.isArray(arg2)) {
          if (arg2.includes(arg1)) {
            return options.fn(this);
          }
        } else {
          return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        }
      },
    },
    partialsDir: [
      path.join(__dirname, "views/partials/"),
      path.join(__dirname, "views/navbar/"),
      path.join(__dirname, "views/auth/"),
      path.join(__dirname, "views/commerce/"),
      path.join(__dirname, "views/customer/"),
      path.join(__dirname, "views/delivery/"),
      path.join(__dirname, "views/admin/"),
    ],
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/pictures");
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({ storage: imageStorage }).single("Image");

app.use((req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      req.flash("error", "Error al subir la imagen.");
      return res.redirect("back");
    } else if (err) {
      req.flash("error", "Error desconocido al subir la imagen.");
      return res.redirect("back");
    }
    next();
  });
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});

const customerRoutes = require("./routes/customer.routes");
const authRoutes = require("./routes/auth.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const adminRoutes = require("./routes/admin.routes");
const commerceRoutes = require("./routes/commerce.routes");
const { FORCE } = require("sequelize/lib/index-hints");


// Rutas públicas
app.use("/", authRoutes);
app.use("/login", authRoutes);


// Rutas protegidas
app.use("/customer", isAuth, authorizeRole("user"), customerRoutes);
app.use("/commerce",isAuth, commerceRoutes);
app.use("/delivery", isAuth, authorizeRole("delivery"), deliveryRoutes);
app.use("/admin", isAuth, authorizeRole("admin"), adminRoutes);


// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// Conectar a la base de datos y arrancar el servidor
connection
  .sync({ force: false })
  .then((result) => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
