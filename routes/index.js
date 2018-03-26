var express = require('express');
var router = express.Router();

var passport = require('passport');

var Order = require('../models/order');
var Cart = require('../models/store');
var Product = require('../models/product');

/* GET home page. */
router.get('/', function (req, res, next) {
    Product.find(function (err, docs) {
        var arrayLength = 3;
        var productArray = [];
        for (var i = 0; i < docs.length; i += arrayLength) {
            productArray.push(docs.slice(i, i + arrayLength));
        }

        res.render('shop/index', {title: 'Shopping Cart', products: productArray});
    });
});

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id; //Retrieve id from the id parameters passed to router '/add-to-cart/'
    //A new model will be created for the cart object
    //A new cart will be created each time user logs in, else the old cart from the session is taken
    //If old cart exists then it will be passed else an empty javascript object is passed
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    //Use mongoose to find product by ID
    Product.findById(productId, function (err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});


router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});


//This will be the click function of the checkout
router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {totalPrice: cart.totalPrice});
});
//  This is the route which will laod the checkout.hbs
router.get('/checkout', checkLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});


router.post('/checkout', checkLoggedIn, function (req, res, next) { //checkLoggedIn will be used to route only if the user has logged in
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")(
        "###################################"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js in checkout.js (search for "val(token)" )
        description: "Test Charge"
    }, function (err, charge) {
        //asynchronously
        if (err) {

            return res.redirect('/checkout');
        }
        //Create a new order and save it in the database
        var order = new Order({
            user: req.user,    //Passport will authenticate the user for us
            cart: cart,
            address: req.body.address,
            name: req.body.name, //Retrieved from checkout.hbs
            paymentId: charge.id  //from the charge object passed from the callback
        });
        //Save it to the database, the obtained order details with payment details
        order.save(function (err, result) {

            req.session.cart = null;
            res.redirect('/');
        });
    });
});


router.get('/user/profile', checkLoggedIn, function (req, res, next) {
    //Mongoose query to find
    Order.find({user: req.user}, function (err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);

        });
        res.render('user/profile', {orders: orders}); //To render the list of orders to the user profile
    });
});

router.get('/logout', checkLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/user/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup');
});

router.get('/user/additem', function (req, res, next) {

    res.render('/user/additem');
});

router.post('/user/additem', function (req, res, next) {
    new Product({
        imagePath: req.body.imagepath,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
    }).save(function (err, result) {
        req.flash('success', 'Successfully added product!');

        res.redirect('/');
    });
});

router.post('/user/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res, next) {  //Same funcitonality as login
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/user/login', function (req, res, next) {

    res.render('/user/login');
});

router.post('/login', passport.authenticate('local.login', {
    failureRedirect: '/user/login',
    failureFlash: true
}), function (req, res, next) { //This will be called only if the login is successful

    res.redirect('/user/profile');

});

module.exports = router;

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


module.exports = router;

