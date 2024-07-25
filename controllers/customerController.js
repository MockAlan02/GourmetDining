const CommerceType = require("../models/commerceType");
const Commerce = require("../models/user");
const Favorite = require("../models/favorite");
const Genre = require("../models/genre");
const Product = require("../models/product");
const sequelize = require("sequelize");

//show all commerce types
async function index(req, res) {
  let commerceTypes = await CommerceType.findAll();
  commerceTypes = commerceTypes.map((type) => type.dataValues);
  res.render("customer/index", { commerceTypes });
}
//show all restaurants by type
async function restaurantsbyType(req, res) {
  let commerceTypes = await CommerceType.findAll();
  commerceTypes = commerceTypes.map((type) => type.dataValues);
  let commerce = await Commerce.findAll({
    where: {
      commerceTypeId: req.params.id,
    },
  });

  commerce = commerce.map((commerce) => commerce.dataValues);
  if (!commerce) {
    req.flash("error", "No restaurants found");
    return res.redirect("/customer");
  }
  res.render("customer/restaurantsbyType", {
    commerceTypes,
    commerce,
    commerceCount: commerce.length,
  });
}

//filter commerce by name
async function filter(req, res) {
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
  });
}

//Mark a commerce as favorite
async function favorite(req, res) {
  const response = await Favorite.create({
    IdUser: req.session.user.id,
    IdCommerce: req.params.id,
  });

  if (response) {
    req.flash("success", "Commerce added to favorites");
    return res.redirect("/customer");
  }
  req.flash("error", "Error adding commerce to favorites");
  res.redirect("/customer");
}

async function commerceDetails(req, res) {
  let commerce = await Commerce.findOne({
    where: {
      id: req.params.id,
    },
  });
  commerce = commerce.dataValues;
  let products = await Product.findAll({
    where: {
      IdCommerce: req.params.id,
    },
  });
  products = products.map((product) => product.dataValues);
  //group products by genre
    let genres = await Genre.findAll();
    genres = genres.map((genre) => genre.dataValues);

    //group products by genre
    let groupedProducts = [];
    genres.forEach((genre) => {
      let productsByGenre = products.filter(
        (product) => product.IdGenre === genre.id
      );
      if (productsByGenre.length > 0) {
        groupedProducts.push({
          genre: genre.name,
          products: productsByGenre,
        });
      }
    });
  res.render("customer/commerceDetails", { commerce, products: groupedProducts });
}

module.exports = {
  index,
};
