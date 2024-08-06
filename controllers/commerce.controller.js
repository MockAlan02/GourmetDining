const CommerceType = require("../models/commerceType");
const User = require("../models/user");
const Order = require("../models/orders");
const Product = require("../models/product");
const OrderProduct = require("../models/orderProduct");
const { errorHandler } = require("../helpers/errorHandler");
const Genre = require("../models/genre");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { get } = require("../services/sendEmail");
const { promises } = require("dns");

async function getProductById(id) {
  let product = await Product.findOne({ where: { id } });
  return product.dataValues;
}

module.exports = {
  async index(req, res) {
    let commerceTypes = await CommerceType.findAll();
    commerceTypes = commerceTypes.map((type) => type.dataValues);
    console.log(commerceTypes);
    res.render("commerce/commerceHome", {
      commerceTypes,
      title: "Home Commerce - Gourmet Dinning",
      page: "commerce",
    });
  },
  async getHome(req, res) {
    try {
      const commerceId = req.user.id; // Asume que el ID del comercio logueado está en req.user.id

      // Obtener pedidos del comercio logueado
      const orders = await Order.findAll({
        where: { commerceId: commerceId },
        include: [
          {
            model: User,
            as: "commerce",
            attributes: ["name"],
          },
          {
            model: Product,
            as: "products",
            attributes: ["name", "price"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const formattedOrders = orders.map((order) => ({
        id: order.id,
        commerceName: order.commerce.name,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        products: order.products.map((product) => ({
          name: product.name,
          price: product.price,
        })),
      }));

      res.render("commerce/commerceHome", {
        orders: formattedOrders,
        title: "Home Commerce - Gourmet Dinning",
        page: "commerce",
      });
    } catch (error) {
      res.status(500).send("Error al obtener los pedidos");
    }
  },

  async getOrderDetails(req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: "commerce",
            attributes: ["name"],
          },
          {
            model: Product,
            as: "products",
            attributes: ["name", "price"],
            through: { attributes: [] },
          },
        ],
      });

      if (!order) {
        return res.status(404).send("Pedido no encontrado");
      }

      const formattedOrder = {
        id: order.id,
        commerceName: order.commerce.name,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        products: order.products.map((product) => ({
          name: product.name,
          price: product.price,
          image: product.image,
        })),
      };

      res.render("commerce/orderDetails", {
        order: formattedOrder,
        title: "Detalles del Pedido - Gourmet Dinning",
        page: "commerce",
      });
    } catch (error) {
      res.status(500).send("Error al obtener los detalles del pedido");
    }
  },

  async assignDelivery(req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.findByPk(orderId);

      if (!order) {
        return res.status(404).send("Pedido no encontrado");
      }

      // Buscar un delivery disponible
      const delivery = await User.findOne({
        where: { role: "delivery", isActive: true },
      });

      if (!delivery) {
        return res
          .status(400)
          .send(
            "No hay delivery disponible en este momento. Intente más tarde."
          );
      }

      // Asignar el delivery al pedido y actualizar el estado del pedido
      await order.update({ status: "en proceso", deliveryId: delivery.id });
      await delivery.update({ isActive: false });

      res.redirect(`/commerce/order/${orderId}`);
    } catch (error) {
      res.status(500).send("Error al asignar el delivery");
    }
  },

  async getProfile(req, res) {
    try {
      const commerce = await User.findByPk(req.session.userId);
      res.render("commerce/profileCommerce", {
        commerce,
        title: "Mi Perfil - Gourmet Dinning",
        page: "commerce",
      });
    } catch (error) {
      res.status(500).send("Error al obtener el perfil");
    }
  },

  async updateProfile(req, res) {
    try {
      const { openingTime, closingTime, phone, email } = req.body;
      const commerce = await User.findByPk(req.session.userId);

      if (req.file) {
        // Manejar la subida del logo
        const logoPath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          req.file.filename
        );
        // Borrar el logo anterior si existe
        if (commerce.picture) {
          fs.unlinkSync(path.join(__dirname, "..", "public", commerce.picture));
        }
        commerce.picture = `/uploads/${req.file.filename}`;
      }

      commerce.openingTime = openingTime;
      commerce.closingTime = closingTime;
      commerce.phone = phone;
      commerce.email = email;

      await commerce.save();
      res.redirect("/commerce/home");
    } catch (error) {
      res.status(500).send("Error al actualizar el perfil");
    }
  },

  async listCategories(req, res) {
    try {
      const commerceId = req.session.user.id; // ID del comercio logueado
      let categories = await CommerceType.findAll({
        where: { IdCommerce: commerceId },
      });
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.findAll({
            where: { IdGenre: category.id },
          });
          return {
            ...category.dataValues,
            productCount: products.length, // Use products.length directly
          };
        })
      );
      res.render("categoriesList", {
        categories: categoriesWithCount,
        title: "Mantenimiento de Categorías - Gourmet Dinning",
        page: "categories",
      });
    } catch (error) {
      res.status(500).send("Error al obtener las categorías");
    }
  },

  async createCategoryForm(req, res) {
    res.render("commerce/createCategorie", {
      title: "Crear Categoría - Gourmet Dinning",
      page: "categories",
    });
  },

  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/categories/create");
      }

      const { name, description } = req.body;

      await CommerceType.create({
        name,
        description,
        IdCommerce: req.session.user.id,
      });

      res.redirect("/categories");
    } catch (error) {
      res.status(500).send("Error al crear la categoría");
    }
  },

  async editCategoryForm(req, res) {
    try {
      const { id } = req.params;
      let category = await CommerceType.findOne({ where: { id } });

      res.render("categories/edit", {
        category : category.dataValues,
        title: "Editar Categoría - Gourmet Dinning",
        page: "categories",
      });
    } catch (error) {
      res.status(500).send("Error al obtener la categoría");
    }
  },
//revisar bien
  async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect(`/categories/edit/` + req.body.id);
      }
      const { id, name, description } = req.body;
    

      const category = await CommerceType.findByPk(id);
      if (!category) {
        return res.status(404).send("Categoría no encontrada");
      }

      category.name = name;
      category.description = description;
      await category.save();

      res.redirect("/categories");
    } catch (error) {
      res.status(500).send("Error al actualizar la categoría");
    }
  },

  async deleteCategoryConfirm(req, res) {
    try {
      const categoryId = req.params.id;
      const category = await CommerceType.findByPk(categoryId);

      if (!category) {
        return res.status(404).send("Categoría no encontrada");
      }

      res.render("categories/delete", {
        category,
        title: "Eliminar Categoría - Gourmet Dinning",
        page: "categories",
      });
    } catch (error) {
      res.status(500).send("Error al obtener la categoría");
    }
  },

  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const category = await CommerceType.findByPk(categoryId);

      if (!category) {
        return res.status(404).send("Categoría no encontrada");
      }

      await category.destroy();
      res.redirect("/categories");
    } catch (error) {
      res.status(500).send("Error al eliminar la categoría");
    }
  },

  async listProducts(req, res) {
    const commerceId = req.session.user.id;

    let products = await Product.findAll({
      where: { IdCommerce: commerceId },
    });
    const productsWithGenre = await Promise.all(
      products.map(async (product) => {
        const genre = await Genre.findOne({
          where: { id: product.dataValues.IdGenre },
        });
        return { ...product.dataValues, genre: genre.dataValues.name };
      })
    );

    res.render("commerce/productsList", {
      products: productsWithGenre,
      title: "Mantenimiento de Productos - Gourmet Dinning",
      page: "products",
    });
  },

  async createProductForm(req, res) {
    try {
      let genreProduct = await Genre.findAll();
      genreProduct = genreProduct.map((genre) => genre.dataValues);
      res.render("commerce/createProduct", {
        genreProduct,
        title: "Crear Producto - Gourmet Dinning",
        page: "products",
      });
    } catch (error) {
      res.status(500).send("Error al obtener las categorías");
    }
  },

  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/commerce/products/create");
      }

      const { name, description, price, category } = req.body;
      const file = req.file;
      if (!file) {
        req.flash("error", "La imagen es requerida");
        return res.redirect("/commerce/products/create");
      }

      const picture = file.path.replace(/^public/, "");

      const response = await Product.create({
        name,
        description,
        price,
        picture,
        IdGenre: category,
        IdCommerce: req.session.user.id,
      });

      res.redirect("/commerce/products");
    } catch (error) {
      res.status(500).send("Error al crear el producto");
    }
  },

  async editProductForm(req, res) {
    const { id } = req.params;
    let product = await getProductById(id);

    if (!product) {
      req.flash("error", "Producto no encontrado");
      return res.redirect("/commerce/products");
    }

    let genre = await Genre.findAll();
    genre = genre.map((genre) => genre.dataValues);

    res.render("commerce/editProduct", {
      product,
      categories: genre,
      title: "Editar Producto - Gourmet Dinning",
      page: "products",
    });
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect(`/commerce/products/edit/` + id);
      }

      // Fetch the product
      const product = await Product.findOne({ where: { id } });
      if (!product) {
        req.flash("error", "Producto no encontrado");
        return res.redirect("/commerce/products");
      }

      // Update product details
      const { name, description, price, category } = req.body;
      if (req.file) {
        const picture = req.file.path.replace(/^public/, "");
        product.picture = picture;
      }

      product.name = name;
      product.description = description;
      product.price = price;
      product.IdGenre = category;
      await product.save();

      res.redirect("/commerce/products");
    } catch (error) {
      req.flash("error", "Error al actualizar el producto");
      res.redirect(`/commerce/products/edit/` + id);
    }
  },

  async deleteProductConfirm(req, res) {
    try {
      const { id } = req.params;
      const product = await getProductById(id);

      if (!product) {
        req.flash("error", "Producto no encontrado");
        return res.redirect("/commerce/products");
      }

      res.render("commerce/deleteProduct", {
        id,
        product,
        title: "Eliminar Producto - Gourmet Dinning",
        page: "products",
      });
    } catch (error) {
      req.flash("error", "Error al obtener el producto");
      res.redirect("/commerce/products");
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ where: { id } }); // Make sure to use the correct model

      if (!product) {
        req.flash("error", "Producto no encontrado");
        return res.redirect("/commerce/products");
      }

      await product.destroy();
      req.flash("success", "Producto eliminado exitosamente");
      res.redirect("/commerce/products");
    } catch (error) {
      console.error(error); // Log the error for debugging
      req.flash("error", "Error al eliminar el producto");
      res.redirect("/commerce/products");
    }
  },
};
