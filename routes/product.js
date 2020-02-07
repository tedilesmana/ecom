var express = require('express');
var router = express.Router();
//memasukan data page kedalam database
var Page = require('../models/pages');
var fs = require('fs-extra');
var Product = require('../models/product');
var Katagories = require('../models/kategories');



router.get('/', function (req, res) {
    Product.find(function (err, product) {
        if (err) {
            console.log(err);
        }

        res.render('all_product', {
            title: 'All Product',
            product: product
        });
    });
});

//router untuk menangkap kategories
router.get('/kategory/:kategories', function (req, res) {
    var kategoryLink = req.params.kategories;

    Katagories.findOne({
        link: kategoryLink
    }, function (err, kat) {
        Product.find({
            kategories: kategoryLink
        }, function (err, product) {
            if (err) {
                console.log(err);
            }
            res.render('kat_product', {
                title: 'kat.title',
                product: product
            });
        });
    });
});

// detail product
router.get('/detail/:product', function (req, res) {
    Product.findOne({
        link: req.params.product
    }, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            res.render('product_detail', {
                product: product
            });
        }

    });
})

// router.get('/detail/:product', function (req, res) {
//     Product.findOne({
//         link: req.params.product
//     }, function (err, product) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render('product_detail', {
//                 product: product
//             });
//         }
//     });
// });
module.exports = router;