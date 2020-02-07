var express = require('express');
var router = express.Router();
//memasukan data page kedalam database
var Page = require('../models/pages');

router.get('/', function (req, res) {
    Page.find({}).sort({
        sorting: 1
    }).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });

    });
});

router.get('/', function (req, res) {
    res.render('index', {
        h1: 'Admin area'
    });
});

router.get('/add-page', function (req, res) {
    var title = "";
    var link = "";
    var content = "";

    res.render('admin/add_pages', {
        title: title,
        link: link,
        content: content
    });
});

router.post('/add-page', function (req, res) {
    req.checkBody('title', 'Tiltle harus diisi').notEmpty();
    req.checkBody('content', 'Content harus diisi').notEmpty();

    var title = req.body.title;
    var link = req.body.link.replace(/\s+/g, '-').toLowerCase();

    if (link == "") {
        title = req.body.title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_pages', {
            errors: errors,
            title: title,
            content: content
        });
    } else {
        //memasukan data page kedalam database
        Page.findOne({
            link: link
        }, function (err, page) {
            if (page) {
                req.flash('danger', 'Page ini telah ada gunakan nama lain');
                res.render('admin/pages/add_pages', {
                    title: title,
                    link: link,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    link: link,
                    content: content,
                    sorting: 100
                });

                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                    };
                    Page.find({}).sort({
                        sorting: 1
                    }).exec(function (err, pagess) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pagess;
                        }
                    });

                    req.flash('success', 'Page Berhasil Ditambahkan!');
                    var title = "";
                    var link = "";
                    var content = "";

                    res.redirect('/admin/pages');

                });
            };

        });

    };
});

function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    ++count;
                    if (count >= ids, length) {
                        callback();
                    }
                })
            })
        })(count);
    }
}
//menampung data
router.post('/reorder-pages', function (req, res) {
    var id = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({
            sorting: 1
        }).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });
});
//MENGEDIT PAGE
router.get('/edit-page/:id', function (req, res) {

    Page.findById(req.params.id, function (err, page) {
        if (err) {
            return console.log(err);
        }
        res.render('admin/pages/edit_pages', {
            title: page.title,
            link: page.link,
            content: page.content,
            id: page._id
        });
    });
});

router.post('/edit-page', function (req, res) {
    req.checkBody('title', 'Tiltle harus diisi').notEmpty();
    req.checkBody('content', 'Content harus diisi').notEmpty();

    var title = req.body.title;
    var link = req.body.link.replace(/\s+/g, '-').toLowerCase();

    if (link == "") {
        title = req.body.title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/pages/edit_pages', {
            errors: errors,
            title: title,
            content: content
        });
    } else {
        //memasukan data page kedalam database
        Page.findOne({
            link: link
        }, function (err, page) {
            if (page) {
                req.flash('danger', 'Page ini telah ada gunakan nama lain');
                res.render('admin/pages/edit_pages', {
                    title: title,
                    link: link,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    link: link,
                    content: content,
                    sorting: 100
                });

                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                    };
                    Page.find({}).sort({
                        sorting: 1
                    }).exec(function (err, pagess) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pagess;
                        }
                    });

                    req.flash('success', 'Page Berhasil Diubah!');
                    var title = "";
                    var link = "";
                    var content = "";

                    res.redirect('/admin/pages');

                });
            };

        });

    };
});
//MENGHAPUS PAGE
router.get('/delete-page/:id', function (req, res) {

    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            return console.log(err);
        }
        Page.find({}).sort({
            sorting: 1
        }).exec(function (err, pages) {
            if (err) {
                return console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page Berhasil Dihapus!');
        res.redirect('/admin');
    });
});

module.exports = router;