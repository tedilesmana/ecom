var express = require('express');
var router = express.Router();
var Product = require('../models/product');

router.get('/add/:product', function (req, res) {
    var link = req.params.product;

    Product.findOne({
        link: link
    }, function (err, product) {
        if (err) {
            console.log(err);
        }

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: link,
                qty: 1,
                price: product.price,
                image: '/product_images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == link) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: link,
                    qty: 1,
                    price: product.price,
                    image: '/product_images/' + product._id + '/' + product.image
                });
            }
        }

        req.flash('success', 'Product Berhasil Ditambahkan');
        res.redirect('back');
    });
});


router.get('/shopping-cart', function (req, res) {
    res.render('shopping_cart', {
        title: 'Shopping Cart',
        cart: req.session.cart
    });
});


router.get('/update/:product', function (req, res) {
    var link = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == link) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) {
                        cart.splice(i, 1);
                    }
                    break;

                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) {
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('Perubahan data tidak jadi ');
                    break;
            }
            break;
        }

    }
    req.flash('success', 'Cart Berhasil Diubah!');
    res.redirect('/cart/shopping-cart');
});

router.get('/clear', function (req, res) {

    delete req.session.cart;

    req.flash('success', 'Cart Berhasil Dihapus!');
    res.redirect('/cart/shopping-cart');
});

router.get('/checkout', function (req, res) {
    res.render('checkout', {
        title: 'checkout',
        cart: req.session.cart
    });
});

module.exports = router;