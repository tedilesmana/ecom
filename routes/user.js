var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require("bcryptjs");
var User = require('../models/user');

router.get('/login', function (req, res) {
    if (res.locals.user) {
        res.redirect('/');
    }
    res.render('login', {
        title: 'Log In'
    });
});
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register'
    });
});

router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name tidak boleh kosong!').notEmpty();
    req.checkBody('email', 'Email tidak boleh kosong!').isEmail();
    req.checkBody('username', 'Username tidak boleh kosong!').notEmpty();
    req.checkBody('password', 'Password tidak boleh kosong!').notEmpty();
    req.checkBody('password2', 'Komfirmasi password2 tidak sama dengan password!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({
            usrname: username
        }, function (err, user) {
            if (err) {
                console.log(err);
            }
            if (user) {
                req.flash('danger', 'Usename sudah ada, silahkan memakai akun lainnya!');
                res.redirect('/user/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) {
                            console.log(err);
                        }
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Selamat, Kamu telah registrasi di GuloShop!');
                                res.redirect('/user/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success', 'Kamu Berhasil Keluar!');
    res.redirect('/user/login');
});
module.exports = router;