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

module.exports = {
  // Dashboard
  async index(req, res) {
    res.render("admin/adminHome", {
      title: "Dashboard - Admin",
      page: "admin",
    });
  },

  // Listado de Clientes
    async listClients(req, res) {
      try {
        let users = await User.findAll({
          include: [{
            model: Order,
            as: 'orders',
          }],
        });
        users = users.map(user => ({
          ...user.dataValues,
          orderCount: user.orders.length,
        }));
        
        res.render('admin/listClients', { clients: users });
      } catch (error) {
        console.error('Error listing clients:', error);
        res.status(500).send('Internal Server Error');
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

      req.flash("success", `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`);
      res.redirect("/admin/clients");
    } catch (error) {
      console.error("Error toggling client status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Listado de Deliveries
    async listDeliveries(req, res) {
      try {
        let deliveries = await Delivery.findAll({
          include: [{
            model: Order,
            as: 'orders',
          }],
        });
        deliveries = deliveries.map(delivery => ({
          ...delivery.dataValues,
          orderCount: delivery.orders.length, 
        }));
        
        res.render('admin/listDeliveries', { deliveries: deliveries });
      } catch (error) {
        console.error('Error listing deliveries:', error);
        res.status(500).send('Internal Server Error');
      }
    },
  
  async toggleDeliveryStatus(req, res) {
    try {
      const { id } = req.params;
      const delivery = await User.findByPk(id);

      if (!delivery) {
        req.flash("error", "Delivery not found");
        return res.redirect("/admin/deliveries");
      }

      delivery.isActive = !delivery.isActive;
      await delivery.save();

      req.flash("success", `Delivery ${delivery.isActive ? 'activated' : 'deactivated'} successfully`);
      res.redirect("/admin/deliveries");
    } catch (error) {
      console.error("Error toggling delivery status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Listado de Comercios
    async listCommerces(req, res) {
      try {
        let commerces = await Commerce.findAll({
          include: [{
            model: Order,
            as: 'orders',
          }],
        });
          commerces = commerces.map(commerce => ({
          ...commerce.dataValues,
          orderCount: commerce.orders.reduce((sum, order) => sum + order.orderCount, 0), 
        }));
  
        res.render('admin/listCommerces', { commerces: commerces });
      } catch (error) {
        console.error('Error listing commerces:', error);
        res.status(500).send('Internal Server Error');
      }
    },

  // Activar/Desactivar Comercio
  async toggleCommerceStatus(req, res) {
    try {
      const { id } = req.params;
      const commerce = await Commerce.findByPk(id);

      if (!commerce) {
        req.flash("error", "Commerce not found");
        return res.redirect("/admin/commerces");
      }

      commerce.isActive = !commerce.isActive;
      await commerce.save();

      req.flash("success", `Commerce ${commerce.isActive ? 'activated' : 'deactivated'} successfully`);
      res.redirect("/admin/commerces");
    } catch (error) {
      console.error("Error toggling commerce status:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Mantenimiento de Configuración
  async configMaintenance(req, res) {
    try {
      let taxConfig = await TaxConfiguration.findOne();
      if (!taxConfig) {
        taxConfig = {};
      }
      res.render("admin/configMaintenance", {
        taxConfig,
        title: "Mantenimiento de Configuración - Admin",
        page: "configMaintenance"
      });
    } catch (error) {
      console.error("Error fetching configuration:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Editar Configuración
  async editConfig(req, res) {
    try {
      let taxConfig = await TaxConfiguration.findOne();
      if (!taxConfig) {
        taxConfig = {};
      }
      res.render("admin/configEdit", {
        taxConfig,
        title: "Editar Configuración - Admin",
        page: "configEdit"
      });
    } catch (error) {
      console.error("Error fetching configuration for edit:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Guardar Configuración
  async saveConfig(req, res) {
    try {
      const { itbis } = req.body;
      let taxConfig = await TaxConfiguration.findOne();

      if (!taxConfig) {
        taxConfig = await TaxConfiguration.create({ tax: itbis });
      } else {
        await taxConfig.update({ tax: itbis });
      }

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
      let admins = await User.findAll({ where: { role: 'admin' } });

      admins = admins.map(admin => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        username: admin.username,
        cedula: admin.cedula,
        email: admin.email,
        isActive: admin.isActive
      }));

      res.render("admin/adminsList", {
        admins,
        title: "Listado de Administradores - Admin",
        page: "admins"
      });
    } catch (error) {
      console.error("Error listing admins:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Crear Administrador
  async createAdmin(req, res) {
    try {
      const { firstName, lastName, username, cedula, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        firstName,
        lastName,
        username,
        cedula,
        email,
        password: hashedPassword,
        role: 'admin'
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
      const admin = await User.findByPk(id);

      if (!admin) {
        req.flash("error", "Administrator not found");
        return res.redirect("/admin/admins");
      }

      res.render("admin/adminForm", {
        admin,
        title: "Editar Administrador - Admin",
        page: "adminEdit"
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
      const { firstName, lastName, username, cedula, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect(`/admin/admins/${id}/edit`);
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const admin = await User.findByPk(id);

      if (!admin) {
        req.flash("error", "Administrator not found");
        return res.redirect("/admin/admins");
      }

      await admin.update({
        firstName,
        lastName,
        username,
        cedula,
        email,
        password: hashedPassword || admin.password
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
  }
};
