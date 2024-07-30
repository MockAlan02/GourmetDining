const CommerceType = require("../models/commerceType");
const Commerce = require("../models/user");
const User = require("../models/user");
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
        res.render("commerce/customerHome", {
            commerceTypes,
            title: 'Home Commerce - Gourmet Dinning'
        });
    },
}