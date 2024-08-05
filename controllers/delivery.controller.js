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
        res.render("delivery/homeDelivery", {
            commerceTypes,
            title: "Delivery - Gourmet Dinning",
            page: "delivery",
        });
    },
    async ordersDelivery(req, res) {
        let commerceTypes = await CommerceType.findAll();
        commerceTypes = commerceTypes.map((type) => type.dataValues);
        res.render("delivery/orderDetailDelivery", {
            commerceTypes,
            title: "Delivery - Gourmet Dinning",
            page: "delivery",
        });
    },
    async profileDelivery(req, res) {
        let commerceTypes = await CommerceType.findAll();
        commerceTypes = commerceTypes.map((type) => type.dataValues);
        res.render("delivery/profileDelivery", {
            commerceTypes,
            title: "Delivery - Gourmet Dinning",
            page: "delivery",
        });
    },
}
