var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var validation = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');

//monggoos
mongoose.connect(config.database);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to Mongodb');
});

var app = express();

//bodyparser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))
// parse application/json
app.use(bodyParser.json())

//express session 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: {
  //   secure: true
  // }
}))

//message
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator
app.use(validation({
  customValidators: {
    isImage: function (value, filename) {
      var extension = (path.extname(filename)).toLocaleLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));

//express 
app.use(fileUpload());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//set global variabel 
app.locals.errors = null;

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
  res.locals.cart = req.session.cart;
  var cart = req.session.cart;
  var qty = 0;
  if (typeof cart == "undefined") {
    qty = 0;
  } else {
    for (var i = 0; i < cart.length; i++) {
      qty = qty + cart[i].qty;
    }
  }

  res.locals.qtyheader = qty;
  next();
});

var Page = require('./models/pages');
var pages = require('./routes/pages.js');
var cart = require('./routes/cart.js');
var users = require('./routes/user.js');
var productuser = require('./routes/product.js');
var Kategory = require('./models/kategories');
var pagesadmin = require('./routes/admin_pages.js');
var katadmin = require('./routes/admin_kategories.js');
var productadmin = require('./routes/admin_product.js');

app.use('/', pages);
app.use('/admin/pages', pagesadmin);
app.use('/admin/kategories', katadmin);
app.use('/admin/product', productadmin);
app.use('/products', productuser);
app.use('/cart', cart);
app.use('/user', users);
var port = 3000;
//menyambungkan dengan 

//get all page to header.ejs
// route user
// route user
Page.find({}).sort({
  sorting: 1
}).exec(function (err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// UNTUK MENAMPILKAN DATA CATEGORIS DI FRONT END
Kategory.find(function (err, kategories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.kategories = kategories;
  }
});

app.listen(port, function () {
  console.log('Server berjalan dengan port ' + port);
});