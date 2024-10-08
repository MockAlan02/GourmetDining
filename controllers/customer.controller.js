const CommerceType = require("../models/commerceType");
const Commerce = require("../models/user");
const User = require("../models/user");
const Favorite = require("../models/favorite");
const Genre = require("../models/genre");
const Product = require("../models/product");
const OrderProduct = require("../models/orderProduct");
const Direccion = require("../models/direction");
const TaxConfiguration = require("../models/taxConfiguration");
const Order = require("../models/orders");

const sequelize = require("sequelize");

module.exports = {
  async index(req, res) {
    let commerceTypes = await CommerceType.findAll();
    commerceTypes = commerceTypes.map((type) => type.dataValues);
    res.render("customer/customerHome", {
      commerceTypes,
      title: "Home - Gourmet Dinning",
      page: "customer",
    });
  },

  async newaddress(req, res) {
    res.render("customer/newAdress");
  },

  async createAddress(req, res) {
    const { name, address } = req.body;

    const response = await Direccion.create({
      IdUser: req.session.user.id,
      name,
      address,
    });

    if (response) {
      req.flash("success", "Address added successfully");
      return res.redirect("/customer/address");
    }

    req.flash("error", "Error adding address");
    res.redirect("/customer/form/adress");
  },

  async geteditaddress(req, res) {
    const { id } = req.params;
    let address = await Direccion.findOne({
      where: {
        id,
      },
    });
    address = address.dataValues;
    res.render("customer/newAdress", {
      address,
      title: "Edit Address - Gourmet Dinning",
      page: "editaddress",
    });
  },

  async customeraddress(req, res) {
    let address = await Direccion.findAll({
      where: {
        IdUser: req.session.user.id,
      },
    });
    address = address.map((address) => address.dataValues);
    res.render("customer/customerAdress", {
      address,
      title: "Address - Gourmet Dinning",
      page: "customeraddress",
    });
  },

  async editAddress(req, res) {
    const { id } = req.params;
    const { name, address } = req.body;
    const direction = await Direccion.findOne({
      where: {
        id,
      },
    });

    if (!direction) {
      req.flash("error", "Address not found");
      return res.redirect("/customer/address");
    }
    direction.name = name;
    direction.address = address;
    await direction.save();
    req.flash("success", "Address updated successfully");
    res.redirect("/customer/address");
  },

  async deleteAddress(req, res) {
    const { id } = req.params;
    const response = await Direccion.destroy({
      where: {
        id: id,
      },
    });
    req.flash(
      response
        ? ("success", "Address deleted successfully")
        : ("error", "Error deleting address")
    );
    res.redirect("/customer/address");
  },
  async restaurantsbyType(req, res) {
    const { id } = req.params;

    // Verifica que el id sea un número, si la columna commerceType es un entero
    if (isNaN(id)) {
      req.flash("error", "Invalid commerce type ID");
      return res.redirect("/customer");
    }

    let commerce;
    try {
      commerce = await User.findAll({
        where: {
          commerceType: id,
        },
      });

      commerce = commerce.map((data) => data.dataValues);

      if (commerce.length === 0) {
        req.flash("error", "No restaurants found");
        return res.redirect("/customer");
      }

      res.render("customer/restaurantsbyType", {
        commerce,
        commerceCount: commerce.length,
        title: "Commerces - Gourmet Dinning",
        page: "restaurantsbyType",
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "An error occurred while fetching restaurants");
      res.redirect("/customer");
    }
  },

  async filter(req, res) {
    let commerceTypes = await CommerceType.findAll();
    commerceTypes = commerceTypes.map((type) => type.dataValues);
    let commerce = await Commerce.findAll({
      where: {
        name: {
          [sequelize.Op.like]: `%${req.body.name}%`,
        },
      },
    });
    let commerceCount = await Commerce.count({
      where: { CommerceType: req.params.id },
    });

    commerce = commerce.map((commerce) => commerce.dataValues);
    res.render("customer/restaurantsbyType", {
      commerceTypes,
      commerce,
      commerceCount,
      title: "Commerces - Gourmet Dinning",
    });
  },
  async commerceDetails(req, res) {
    try {
      const id = req.params.id;

      // Fetch commerce details
      let commerce = await User.findOne({ where: { id } });
      if (!commerce) {
        req.flash("error", "Commerce not found");
        return res.redirect("/customer");
      }
      commerce = commerce.dataValues;

      // Fetch products for the commerce
      let products = await Product.findAll({ where: { IdCommerce: id } });
      products = products.map((product) => product.dataValues);

      // Fetch genres for the commerce
      let genres = await Genre.findAll({ where: { IdCommerce: id } });
      genres = genres.map((genre) => genre.dataValues);
      console.log(id);
      console.log(genres);
      console.log(products);
      // Group products by genre
      let groupedProducts = genres
        .map((genre) => {
          let productsByGenre = products.filter(
            (product) => product.IdGenre === genre.id
          );
          console.log(`Products for genre ${genre.name}:`, productsByGenre);
          return {
            genre: genre.name,
            products: productsByGenre,
          };
        })
        .filter((group) => group.products.length > 0); // Solo incluir grupos no vacíos

      // Depuración: Log los productos agrupados usando JSON.stringify
      console.log(
        "Grouped Products:",
        JSON.stringify(groupedProducts, null, 2)
      );

      // Render the commerce details with grouped products
      res.render("customer/commerceDetails", {
        commerce,
        products: groupedProducts,
      });
    } catch (error) {
      console.error("Error fetching commerce details:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Crear una orden
  async createOrder(req, res) {
    const { IdDireccion, IdCommerce, productsList } = req.body;
    const direccion = await Direccion.findOne({
      where: {
        id: IdDireccion,
      },
    });

    if (!direccion) {
      req.flash("error", "Address not found");
      return res.redirect("/customer");
    }

    const commerce = await Commerce.findOne({
      where: {
        id: IdCommerce,
      },
    });

    if (!commerce) {
      req.flash("error", "Commerce not found");
      return res.redirect("/customer");
    }
    const order = await Order.create({
      IdUser: req.session.user.id,
      IdDireccion,
      IdCommerce,
      subtotal: 0,
      total: 0,
      dateHour: new Date(),
      status: "PENDING",
      typeProcess: "DELIVERY",
    });

    let subtotal = 0;
    let total = 0;
    productsList.forEach(async (product) => {
      let productData = await Product.findOne({
        where: {
          id: product.id,
        },
      });
      if (!productData) {
        req.flash("error", "Product not found");
        return res.redirect("/customer");
      }
      subtotal += productData.price * product.quantity;
      await OrderProduct.create({
        IdOrder: order.id,
        IdProduct: productData.id,
        quantity: product.quantity,
      });
    });
    let itbis = await TaxConfiguration.findAll();
    itbis = itbis.map((tax) => tax.dataValues);
    let taxConfiguration = itbis[0];
    total = subtotal + subtotal * taxConfiguration.tax;

    await order.update({
      subtotal,
      total,
    });

    req.flash("success", "Order created successfully");
    res.redirect("/customer");
  },

  // Actualizar cliente
  async updateClient(req, res) {
    const { name, email, phone } = req.body;
    const file = req.file;
    let picture = "";
    const user = await User.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/customer");
    }

    if (file) {
      picture = file.path.replace(/^public/, "");
    } else {
      picture = user.picture;
    }

    await user.update({
      name,
      email,
      phone,
      picture,
    });
    req.flash("success", "User updated successfully");
    res.redirect("/customer");
  },

  // Mostrar órdenes del usuario
  async myOrders(req, res) {
    try {
      let orders = await Order.findAll({
        where: {
          IdUser: req.session.user.id,
        },
      });
      orders = orders.map((order) => order.dataValues);

      let ordersCommerce = await Promise.all(
        orders.map(async (order) => {
          let commerce = await Commerce.findOne({
            where: {
              id: order.IdCommerce,
            },
          });

          commerce = commerce.dataValues;

          let orderProducts = await OrderProduct.findAll({
            where: {
              IdOrder: order.id,
            },
          });

          orderProducts = orderProducts.map(
            (orderProduct) => orderProduct.dataValues
          );

          return {
            picture: commerce.picture,
            name: commerce.name,
            status: order.status,
            dateHour: order.dateHour,
            total: order.total,
            productsCount: orderProducts.length,
          };
        })
      );

      res.render("customer/myOrders", { ordersCommerce });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Mostrar detalles de una orden
  async orderDetails(req, res) {
    try {
      let order = await Order.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (!order) {
        return res.status(404).send("Order not found");
      }

      order = order.dataValues;

      let orderProducts = await OrderProduct.findAll({
        where: {
          IdOrder: req.params.id,
        },
      });
      orderProducts = orderProducts.map(
        (orderProduct) => orderProduct.dataValues
      );

      let commerce = await Commerce.findOne({
        where: {
          id: order.IdCommerce,
        },
      });
      if (!commerce) {
        return res.status(404).send("Commerce not found");
      }

      commerce = commerce.dataValues;

      let orderDetails = {
        name: commerce.name,
        state: order.status,
        dateHour: order.dateHour,
        products: [],
        total: order.total,
      };

      let productPromises = orderProducts.map(async (product) => {
        let productData = await Product.findOne({
          where: {
            id: product.IdProduct,
          },
        });
        if (!productData) {
          return null;
        }
        productData = productData.dataValues;

        return {
          name: productData.name,
          quantity: product.quantity,
          price: productData.price,
        };
      });

      let products = await Promise.all(productPromises);
      products = products.filter((product) => product !== null);

      orderDetails.products = products;

      res.render("customer/orderDetails", { orderDetails });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};
