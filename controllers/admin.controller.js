const CommerceType = require("../models/commerceType");
const Commerce = require("../models/user");
const User = require("../models/user");
const TaxConfiguration = require("../models/taxConfiguration");
const Order = require("../models/orders");
const Product = require("../models/product");
const bcrypt = require("bcryptjs");
module.exports = {
  // Dashboard
  async index(req, res) {
    const inativeCommerces = await Commerce.findAll({
      where: {
        isActive: false,
      },
    });
    const inativeDeliveries = await User.findAll({
      where: {
        role: "delivery",
        isActive: false,
      },
    });
    const inativeClients = await User.findAll({
      where: {
        role: "user",
        isActive: false,
      },
    });
    const activeCommerces = await Commerce.findAll({
      where: {
        isActive: true,
      },
    });
    const activeDeliveries = await User.findAll({
      where: {
        role: "delivery",
        isActive: true,
      },
    });
    const activeClients = await User.findAll({
      where: {
        role: "user",
        isActive: true,
      },
    });

    const products = await Product.findAll();
    const orders = await Order.findAll();
    res.render("admin/adminHome", {
      inativeCommerces: inativeCommerces.length,
      inativeDeliveries: inativeDeliveries.length,
      inativeClients: inativeClients.length,
      activeCommerces: activeCommerces.length,
      activeDeliveries: activeDeliveries.length,
      activeClients: activeClients.length,
      products: products.length,
      orders: orders.length,
      title: "Dashboard - Admin",
      page: "admin",
    });
  },

  // Listado de Clientes
  async listClients(req, res) {
    try {
      let users = await User.findAll({
        where: {
          role: "user",
        },
      });

      // Mapear y agregar conteo de órdenes para cada usuario
      users = await Promise.all(
        users.map(async (user) => {
          let orders = await Order.findAll({
            where: { IdUser: user.id },
          });
          return {
            ...user.dataValues,
            orderCount: orders.length,
          };
        })
      );

      res.render("admin/clientList", { clients: users });
    } catch (error) {
      console.error("Error listing clients:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Activar/Desactivar Cliente
  async toggleClientStatus(req, res) {
    try {
      const { id } = req.params;
      const client = await User.findByPk(id);

      if (!client) {
        req.flash("error", "Client not found");
        return res.redirect("/admin/clients");
      }

      client.isActive = !client.isActive;
      await client.save();

      req.flash(
        "success",
        `Client ${client.isActive ? "activated" : "deactivated"} successfully`
      );
      res.redirect("/admin/clients");
    } catch (error) {
      console.error("Error toggling client status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Listado de Deliveries
  async listDeliveries(req, res) {
    try {
      let users = await User.findAll({
        where: {
          role: "delivery",
        },
      });

      // Mapear y agregar conteo de órdenes para cada usuario
      users = await Promise.all(
        users.map(async (user) => {
          let orders = await Order.findAll({
            where: { IdUser: user.id },
          });
          return {
            ...user.dataValues,
            orderCount: orders.length,
          };
        })
      );

      res.render("admin/clientList", { clients: users });
    } catch (error) {
      console.error("Error listing clients:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async toggleInactiveOrActiveUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      user.isActive = !user.isActive;
      await user.save();
      req.flash(
        "success",
        `User ${user.isActive ? "activated" : "deactivated"} successfully`
      );
      res.redirect("/admin/clients");
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  async toggleInactiveOrActiveCommerce(req, res) {
    try {
      const { id } = req.params;
      const commerce = await User.findByPk(id);
      commerce.isActive = !commerce.isActive;
      await commerce.save();
      req.flash(
        "success",
        `Commerce ${
          commerce.isActive ? "activated" : "deactivated"
        } successfully`
      );
      res.redirect("/admin/commerces");
    } catch (error) {
      console.error("Error toggling commerce status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async toggleInactiveOrActiveDelivery(req, res) {
    try {
      const { id } = req.params;
      const delivery = await User.findByPk(id);
      delivery.isActive = !delivery.isActive;
      await delivery.save();
      req.flash(
        "success",
        `Delivery ${
          delivery.isActive ? "activated" : "deactivated"
        } successfully`
      );
      res.redirect("/admin/deliveries");
    } catch (error) {
      console.error("Error toggling delivery status:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // Listado de Comercios
  async listCommerces(req, res) {
    try {
      let users = await User.findAll({
        where: {
          role: "commerce",
        },
      });

      // Mapear y agregar conteo de órdenes para cada usuario
      users = await Promise.all(
        users.map(async (user) => {
          let orders = await Order.findAll({
            where: { IdCommerce: user.id },
          });
          return {
            ...user.dataValues,
            orderCount: orders.length,
          };
        })
      );

      res.render("admin/commerceList", { commerce: users });
    } catch (error) {
      console.error("Error listing clients:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Editar Configuración
  async editConfig(req, res) {
    try {
      const { id } = req.params;
      let taxConfig = await TaxConfiguration.findOne({ where: { id } });
      if (!taxConfig) {
        taxConfig = {};
      }
      taxConfig = taxConfig.dataValues;
      res.render("admin/editConfiguration", {
        taxConfig,
        title: "Editar Configuración - Admin",
        page: "configEdit",
      });
    } catch (error) {
      console.error("Error fetching configuration for edit:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Guardar Configuración
  async saveConfig(req, res) {
    try {
      const id = req.params.id;

      let taxConfig = await TaxConfiguration.findOne({ where: { id } });
      const { itbis } = req.body;

      taxConfig.tax = itbis;
      await taxConfig.save();
      req.flash("success", "Configuration updated successfully");
      res.redirect("/admin/config-maintenance");
    } catch (error) {
      console.error("Error saving configuration:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Listado de Administradores
  async listAdmins(req, res) {
    try {
      let admins = await User.findAll({ where: { role: "admin" } });

      admins = admins.map((admin) => admin.dataValues);
      admins = admins.filter((x) => x.id !== req.session.user.id);
      res.render("admin/adminList", {
        admins,
        title: "Listado de Administradores - Admin",
        page: "admins",
      });
    } catch (error) {
      console.error("Error listing admins:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  getCreateAdmin(req, res) {
    res.render("admin/adminForm", {
      title: "Crear Administrador - Admin",
      page: "adminCreate",
    });
  },
  // Crear Administrador
  async createAdmin(req, res) {
    try {
      const { firstName, lastName, username, cedula, email, password } =
        req.body;
      const hashedPassword = bcrypt.hashSync(password, 12);

      await User.create({
        name: firstName,
        lastName,
        username,
        cedula,
        email,
        isActive: true,
        password: hashedPassword,
        role: "admin",
      });

      req.flash("success", "Administrator created successfully");
      res.redirect("/admin/admins");
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Editar Administrador
  async editAdmin(req, res) {
    try {
      const { id } = req.params;
      let admin = await User.findOne({ where: { id } });

      if (!admin) {
        req.flash("error", "Administrator not found");
        return res.redirect("/admin/admins");
      }
      admin = admin.dataValues;

      res.render("admin/adminForm", {
        admin,
        title: "Editar Administrador - Admin",
        page: "adminEdit",
      });
    } catch (error) {
      console.error("Error fetching admin for edit:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Guardar Administrador
  async saveAdmin(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        username,
        cedula,
        email,
        password,
        confirmPassword,
      } = req.body;

      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect(`/admin/edit/${id}`);
      }

      const hashedPassword = bcrypt.hashSync(password, 12);
      const admin = await User.findByPk(id);

      if (!admin) {
        req.flash("error", "Administrator not found");
        return res.redirect("/admin/admins");
      }

      await admin.update({
        name: firstName,
        lastName,
        username,
        cedula,
        email,
        password: hashedPassword || admin.password,
      });

      req.flash("success", "Administrator updated successfully");
      res.redirect("/admin/admins");
    } catch (error) {
      console.error("Error saving admin:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Eliminar Administrador
  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      const admin = await User.findByPk(id);

      if (!admin) {
        req.flash("error", "Administrator not found");
        return res.redirect("/admin/admins");
      }

      await admin.destroy();

      req.flash("success", "Administrator deleted successfully");
      res.redirect("/admin/admins");
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  async configMaintenance(req, res) {
    try {
      let taxConfig = await TaxConfiguration.findAll();
      if (!taxConfig) {
        taxConfig = {};
      }
      taxConfig = taxConfig.map((x) => x.dataValues);
      res.render("admin/configuration", {
        taxConfig : taxConfig[0],
        title: "Configuración de Impuestos - Admin",
        page: "config",
      });
    } catch (error) {
      console.error("Error fetching configuration for maintenance:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  async toggleInactiveOrActiveAdmin(req, res) {
    try {
      const { id } = req.params;
      const admin = await User.findByPk(id);
      admin.isActive = !admin.isActive;
      await admin.save();
      req.flash(
        "success",
        `Admin ${admin.isActive ? "activated" : "deactivated"} successfully`
      );
      res.redirect("/admin/admins");
    } catch (error) {
      console.error("Error toggling admin status:", error);
      res.status(500).send("Internal Server Error");
    }
  }
};
