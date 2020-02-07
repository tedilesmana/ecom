var express = require('express');
var router = express.Router();
//memasukan data page kedalam database
var Kategories = require('../models/kategories');

router.get('/', function (req, res) {
    Kategories.find({}).sort({
        sorting: 1
    }).exec(function (err, kategories) {
        res.render('admin/kategories', {
            kategories: kategories
        });

    });
});

router.get('/add-kategories', function (req, res) {
    var title = "";

    res.render('admin/add_kategories', {
        title: title
    });
});

router.post('/add-kategories', function (req, res) {
    req.checkBody('title', 'Tiltle harus diisi').notEmpty();

    var title = req.body.title;
    var link = req.body.title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_kategories', {
            errors: errors,
            title: title

        });
    } else {
        //memasukan data page kedalam database
        Kategories.findOne({
            link: link
        }, function (err, kategories) {
            if (kategories) {
                req.flash('danger', 'Kategori ini telah ada gunakan nama lain');
                res.render('admin/add_kategories', {
                    title: title

                });
            } else {
                var kategories = new Kategories({
                    title: title,
                    link: link

                });

                kategories.save(function (err) {
                    if (err) {
                        return console.log(err);
                    };
                    Kategories.find({}).sort({
                        sorting: 1
                    }).exec(function (err, kategoriess) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.kategories = kategoriess;
                        }
                    });

                    req.flash('success', 'Kategories Berhasil Ditambahkan!');
                    res.redirect('/admin/kategories');

                });
            };

        });

    };
});
//edit
router.get('/edit-kategories/:id', function (req, res) {

    Kategories.findById(req.params.id, function (err, kategories) {
        if (err) {
            return console.log(err);
        }
        res.render('admin/edit_kategories', {
            title: kategories.title,
            id: kategories._id
        });
    });
});

// update data form
router.post('/edit-kategories', function (req, res) {
    req.checkBody('title', 'title Harus diisi dahulu').notEmpty();
    var title = req.body.title;
    var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
    var id = req.body.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_kategories', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Kategories.findOne({
            link: link,
            _id: {
                '$ne': id
            }
        }, function (err, kategories) {
            if (kategories) {
                req.flash('danger', 'kategories ini telah ada, silahkan gunakan nama yang lain');
                res.render('admin/edit_kategories', {
                    title: title,
                    id: id
                });
            } else {

                Kategories.findById(id, function (err, kategories) {
                    if (err) {
                        console.log(err);

                    };

                    kategories.title = title;
                    kategories.link = link;
                    kategories.save(function (err) {
                        if (err) {
                            return console.log(err);
                        };
                        Kategories.find(function (err, kategoriess) {
                            if (err) {
                                console.log(err);

                            } else {
                                req.app.locals.kategories = kategoriess;
                            }
                        });
                        // req.flash('success', 'kategories berhsil di edit');
                        // req.redirect('/admin/kategories');
                        req.flash('success', 'Kategories Berhasil Diupdate!');
                        res.redirect('/admin/kategories');
                    });

                });
            };

        });
    };
});
//MENGHAPUS PAGE
router.get('/delete-kategories/:id', function (req, res) {
    Kategories.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            return console.log(err);
        }
        Kategories.find({}).sort({
            sorting: 1
        }).exec(function (err, kategories) {
            if (err) {
                return console.log(err)
            } else {
                req.app.locals.kategories = kategories;
            }
        });
        req.flash('success', 'Katergories Berhasil ditambahkan!');
        res.redirect('/admin/kategories');
    });
});

module.exports = router;