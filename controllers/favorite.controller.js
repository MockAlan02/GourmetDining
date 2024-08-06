const { where } = require("sequelize");
const Favorite = require("../models/favorite");
const Commerce = require("../models/user")


module.exports = {

  async getFavoritesByUserId(req, res) {
    const idUser = req.session.user.id;
    let favorite = await Favorite.findAll({
      where: {
        IdUser: idUser,
      },
    });
    favorite = favorite.map((value) => value.dataValues);
    favorite = favorite.forEach(async value => {
        let commerce = await Commerce.findAll({
            where : {
                id : value.IdCommerce
            }
        })
        commerce = commerce.map(value => value.dataValues)
        return {
            ...value,
            picture: commerce.picture
        }
    });

    res.render("customer/favorites", {
        favorite
    })

  },

  async createfavorite(req, res) {
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
  },

  async removefavorite(req, res){
    const {id} = req.params;
    const favorite = await Favorite.findAll({
        where : {
            id : id
        }
    })
    favorite.destroy();
    res.redirect("")
  }
};
