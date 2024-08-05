const CommerceType = require("../models/commerceType");
const User = require("../models/user");
const Order = require("../models/orders");
const Product = require("../models/product");
const OrderProduct = require("../models/orderProduct");

const sequelize = require("sequelize");
const fs = require('fs');
const path = require('path');

module.exports = {
    async index(req, res) {
        try {
            let commerceTypes = await CommerceType.findAll();
            commerceTypes = commerceTypes.map((type) => type.dataValues);
            res.render("commerce/commerceHome", {
                commerceTypes,
                title: 'Home Commerce - Gourmet Dinning',
                page: "commerce"
            });
        } catch (error) {
            res.status(500).send('Error al obtener los tipos de comercio');
        }
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
                        as: 'commerce',
                        attributes: ['name']
                    },
                    {
                        model: Product,
                        as: 'products',
                        attributes: ['name', 'price'],
                        through: { attributes: [] }
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const formattedOrders = orders.map(order => ({
                id: order.id,
                commerceName: order.commerce.name,
                status: order.status,
                createdAt: order.createdAt,
                total: order.total,
                products: order.products.map(product => ({
                    name: product.name,
                    price: product.price
                }))
            }));

            res.render('commerce/commerceHome', {
                orders: formattedOrders,
                title: 'Home Commerce - Gourmet Dinning',
                page: "commerce"
            });
        } catch (error) {
            res.status(500).send('Error al obtener los pedidos');
        }
    },

    async getOrderDetails(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        as: 'commerce',
                        attributes: ['name']
                    },
                    {
                        model: Product,
                        as: 'products',
                        attributes: ['name', 'price'],
                        through: { attributes: [] }
                    }
                ]
            });

            if (!order) {
                return res.status(404).send('Pedido no encontrado');
            }

            const formattedOrder = {
                id: order.id,
                commerceName: order.commerce.name,
                status: order.status,
                createdAt: order.createdAt,
                total: order.total,
                products: order.products.map(product => ({
                    name: product.name,
                    price: product.price,
                    image: product.image
                }))
            };

            res.render('commerce/orderDetails', { order: formattedOrder, title: 'Detalles del Pedido - Gourmet Dinning', page:"commerce" });
        } catch (error) {
            res.status(500).send('Error al obtener los detalles del pedido');
        }
    },

    async assignDelivery(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.findByPk(orderId);

            if (!order) {
                return res.status(404).send('Pedido no encontrado');
            }

            // Buscar un delivery disponible
            const delivery = await User.findOne({ where: { role: 'delivery', isActive: true } });

            if (!delivery) {
                return res.status(400).send('No hay delivery disponible en este momento. Intente más tarde.');
            }

            // Asignar el delivery al pedido y actualizar el estado del pedido
            await order.update({ status: 'en proceso', deliveryId: delivery.id });
            await delivery.update({ isActive: false });

            res.redirect(`/commerce/order/${orderId}`);
        } catch (error) {
            res.status(500).send('Error al asignar el delivery');
        }
    },

    async getProfile(req, res) {
        try {
            const commerce = await User.findByPk(req.session.userId);
            res.render('commerce/profileCommerce', { commerce, title: 'Mi Perfil - Gourmet Dinning', page: "commerce" });
        } catch (error) {
            res.status(500).send('Error al obtener el perfil');
        }
    },

    async updateProfile(req, res) {
        try {
            const { openingTime, closingTime, phone, email } = req.body;
            const commerce = await User.findByPk(req.session.userId);

            if (req.file) {
                // Manejar la subida del logo
                const logoPath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
                // Borrar el logo anterior si existe
                if (commerce.picture) {
                    fs.unlinkSync(path.join(__dirname, '..', 'public', commerce.picture));
                }
                commerce.picture = `/uploads/${req.file.filename}`;
            }

            commerce.openingTime = openingTime;
            commerce.closingTime = closingTime;
            commerce.phone = phone;
            commerce.email = email;

            await commerce.save();
            res.redirect('/commerce/home');
        } catch (error) {
            res.status(500).send('Error al actualizar el perfil');
        }
    },

    async listCategories(req, res) {
        try {
            const commerceId = req.user.id; // ID del comercio logueado
            const categories = await CommerceType.findAll({
                where: { commerceId },
                attributes: ['id', 'name', 'description'],
                include: [{
                    model: Product,
                    attributes: [],
                    through: {
                        attributes: []
                    }
                }],
                group: ['CommerceType.id']
            });

            const formattedCategories = categories.map(category => ({
                ...category.dataValues,
                productCount: category.products.length
            }));

            res.render('categories/list', {
                categories: formattedCategories,
                title: 'Mantenimiento de Categorías - Gourmet Dinning',
                page: "categories"
            });
        } catch (error) {
            res.status(500).send('Error al obtener las categorías');
        }
    },

    async createCategoryForm(req, res) {
        res.render('categories/create', {
            title: 'Crear Categoría - Gourmet Dinning',
            page: "categories"
        });
    },

    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            if (!name || !description) {
                return res.status(400).send('Todos los campos son requeridos');
            }

            await CommerceType.create({
                name,
                description,
                commerceId: req.user.id
            });

            res.redirect('/categories');
        } catch (error) {
            res.status(500).send('Error al crear la categoría');
        }
    },

    async editCategoryForm(req, res) {
        try {
            const categoryId = req.params.id;
            const category = await CommerceType.findByPk(categoryId);

            if (!category) {
                return res.status(404).send('Categoría no encontrada');
            }

            res.render('categories/edit', {
                category,
                title: 'Editar Categoría - Gourmet Dinning',
                page: "categories"
            });
        } catch (error) {
            res.status(500).send('Error al obtener la categoría');
        }
    },

    async updateCategory(req, res) {
        try {
            const { id, name, description } = req.body;
            if (!name || !description) {
                return res.status(400).send('Todos los campos son requeridos');
            }

            const category = await CommerceType.findByPk(id);
            if (!category) {
                return res.status(404).send('Categoría no encontrada');
            }

            category.name = name;
            category.description = description;
            await category.save();

            res.redirect('/categories');
        } catch (error) {
            res.status(500).send('Error al actualizar la categoría');
        }
    },

    async deleteCategoryConfirm(req, res) {
        try {
            const categoryId = req.params.id;
            const category = await CommerceType.findByPk(categoryId);

            if (!category) {
                return res.status(404).send('Categoría no encontrada');
            }

            res.render('categories/delete', {
                category,
                title: 'Eliminar Categoría - Gourmet Dinning',
                page: "categories"
            });
        } catch (error) {
            res.status(500).send('Error al obtener la categoría');
        }
    },

    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            const category = await CommerceType.findByPk(categoryId);

            if (!category) {
                return res.status(404).send('Categoría no encontrada');
            }

            await category.destroy();
            res.redirect('/categories');
        } catch (error) {
            res.status(500).send('Error al eliminar la categoría');
        }
    },
    
    async listProducts(req, res) {
        try {
            const commerceId = req.user.id;
            const products = await Product.findAll({
                where: { commerceId },
                include: [
                    {
                        model: CommerceType,
                        attributes: ['name']
                    }
                ]
            });

            res.render('commerce/products/list', {
                products,
                title: 'Mantenimiento de Productos - Gourmet Dinning',
                page: "products"
            });
        } catch (error) {
            res.status(500).send('Error al obtener los productos');
        }
    },

    async createProductForm(req, res) {
        try {
            const categories = await CommerceType.findAll({
                where: { commerceId: req.user.id }
            });

            res.render('commerce/products/create', {
                categories,
                title: 'Crear Producto - Gourmet Dinning',
                page: "products"
            });
        } catch (error) {
            res.status(500).send('Error al obtener las categorías');
        }
    },

    async createProduct(req, res) {
        try {
            const { name, description, price, categoryId } = req.body;

            if (!name || !description || !price || !categoryId) {
                return res.status(400).send('Todos los campos son requeridos');
            }

            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/${req.file.filename}`;
            }

            await Product.create({
                name,
                description,
                price,
                image: imagePath,
                categoryId,
                commerceId: req.user.id
            });

            res.redirect('/commerce/products');
        } catch (error) {
            res.status(500).send('Error al crear el producto');
        }
    },

    async editProductForm(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }

            const categories = await CommerceType.findAll({
                where: { commerceId: req.user.id }
            });

            res.render('commerce/products/edit', {
                product,
                categories,
                title: 'Editar Producto - Gourmet Dinning',
                page: "products"
            });
        } catch (error) {
            res.status(500).send('Error al obtener el producto');
        }
    },

    async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const { name, description, price, categoryId } = req.body;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }

            if (!name || !description || !price || !categoryId) {
                return res.status(400).send('Todos los campos son requeridos');
            }

            let imagePath = product.image;
            if (req.file) {
                // Eliminar la imagen anterior si existe
                if (product.image) {
                    fs.unlinkSync(path.join(__dirname, '..', 'public', product.image));
                }
                imagePath = `/uploads/${req.file.filename}`;
            }

            product.name = name;
            product.description = description;
            product.price = price;
            product.image = imagePath;
            product.categoryId = categoryId;
            await product.save();

            res.redirect('/commerce/products');
        } catch (error) {
            res.status(500).send('Error al actualizar el producto');
        }
    },

    async deleteProductConfirm(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }

            res.render('commerce/products/delete', {
                product,
                title: 'Eliminar Producto - Gourmet Dinning',
                page: "products"
            });
        } catch (error) {
            res.status(500).send('Error al obtener el producto');
        }
    },

    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }

            // Eliminar la imagen del producto si existe
            if (product.image) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', product.image));
            }

            await product.destroy();
            res.redirect('/commerce/products');
        } catch (error) {
            res.status(500).send('Error al eliminar el producto');
        }
    }
};