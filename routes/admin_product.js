var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

//memasukan data page kedalam database
var Product = require('../models/product');
var Kategories = require('../models/kategories');

router.get('/', function (req, res) {
    Product.count(function (err, c) {
        count = c;
    });
    Product.find(function (err, product) {
        res.render('admin/product', {
            product: product,
            count: count
        });
    });
});


router.get('/add-product', function (req, res) {
    //res.send('Hello word');

    var title = "";
    var desc = "";
    var price = "";
    var qty = "";

    Kategories.find(function (err, kategoriess) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            kategories: kategoriess,
            price: price,
            qty:qty
        });
    });


});

//add product
router.post('/add-product', function (req, res) {
    if (req.body.noimage == "") {
        var imageFile = "";
    } else {
        var imageFile = req.files.image.name;
    }
    // var imageFile  = typeof req.files.image  !== "undefined" ? req.files.image.name : ""; 

    req.checkBody('title', 'title Harus diisi dahulu').notEmpty();
    req.checkBody('desc', 'Deskripsi tidak boleh kosong').notEmpty();
    req.checkBody('price', 'Harga Harus diisi dahulu').isDecimal();
    req.checkBody('image', 'Gambar Harus diisi dahulu').isImage(imageFile);


    var title = req.body.title;
    var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var kategories = req.body.kategories;
    var qty = req.body.qty;

    var errors = req.validationErrors();

    if (errors) {
        Kategories.find(function (err, kategoriess) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                kategories: kategoriess,
                price: price,
                qty:qty
            });
        });
    } else {
        Product.findOne({
            link: link
        }, function (err, product) {
            if (product) {
                req.flash('danger', 'Produk ini telah ada, silahkan gunakan nama yang lain');
                Kategories.find(function (err, kategoriess) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        kategories: kategoriess,
                        price: price,
                        qty:qty
                    });
                });

            } else {
                var product = new Product({
                    title: title,
                    link: link,
                    desc: desc,
                    price: price,
                    qty:qty,
                    kategories: kategories,
                    image: imageFile
                });
                product.save(function (err) {
                    if (err) {
                        return console.log(err);
                    };

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        })
                    }

                    req.flash('success', 'Product Berhasil Ditambahkan!');
                    res.redirect('/admin/product');

                });
            };

        });
    };
});
//edit
router.get('/edit-product/:id', function (req, res) {
    Kategories.find(function (err, kategories) {
        Product.findById(req.params.id, function (err, product) {
            if (err) {
                return console.log(err);
                res.redirect('/admin/product');
            } else {
                res.render('admin/edit_product', {
                    title: product.title,
                    desc: product.desc,
                    kategories: kategories,
                    kategory: product.kategories,
                    price: product.price,
                    image: product.image,
                    qty:product.qty,
                    id: product._id
                });
            };
        });
    });
});

router.post('/edit-product/', function (req, res) {
    if (req.body.noimage == "") {
        var imageFile = "";
    } else {
        var imageFile = req.files.image.name;
    }
    // var imageFile  = typeof req.files.image  !== "undefined" ? req.files.image.name : ""; 

    req.checkBody('title', 'title Harus diisi dahulu').notEmpty();
    req.checkBody('desc', 'Deskripsi tidak boleh kosong').notEmpty();
    req.checkBody('price', 'Harga Harus diisi dahulu').isDecimal();
    req.checkBody('image', 'Gambar Harus diisi dahulu').isImage(imageFile);


    var title = req.body.title;
    var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var qty = req.body.qty;
    var kategories = req.body.kategories;
    var piimage = req.body.piimage;
    var id = req.body.id;

    var errors = req.validationErrors();

    if (errors) {
        Kategories.find(function (err, kategoriess) {
            res.redirect('/admin/product/edit-product/' + id);
        });
    } else {
        Product.findOne({
            link: link,
            _id: {
                '$ne': id
            }
        }, function (err, product) {
            if (err) {
                console.log(err)
            }
            if (product) {
                req.flash('danger', 'Produk ini telah ada, silahkan gunakan nama yang lain');
                res.redirect('/admin/product/edit-product/' + id);

            } else {
                Product.findById(id, function (err, p) {
                    if (err) {
                        console.log(err);
                    }
                    p.title = title;
                    p.link = link;
                    p.desc = desc;
                    p.qty = qty;
                    p.price = price;
                    p.kategories = kategories;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                        if (imageFile != "") {
                            if (piimage != "") {
                                fs.remove('public/product_images/' + id + '/' + piimage, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                        };

                        req.flash('success', 'Product Berhasil Diubah!');
                        res.redirect('/admin/product/edit-product/' + id);

                    });
                })

            };

        });
    };
});


//delete
router.get('/delete-product/:id', function (req, res) {
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            return console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            req.flash('success', 'Product Berhasil Didelete!');
            res.redirect('/admin/product');

        }
    });

});
module.exports = router;