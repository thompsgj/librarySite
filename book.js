var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;


var monk = require('monk');
var db = monk('localhost:27017/bookdb');

var routes = require('./app_server/routes/index');
var routesApi = require('./app_api/routes/index');

var handlebars = require('express3-handlebars').create({
	defaultLayout:'main',
	//necessary for injecting views into layouts when desired
	helpers: {
		section: function(name, options) {
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		},
		messageAlert: function(val) {
			if(val == "success") {
				return "alert alert-success"
			} else {
				return "alert alert-danger"
			}
		}
	}
});


var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

//Declare public folder
//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(require('connect-flash')());
app.use(function(req, res, next) {
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
})


app.use(function (req, res, next){
	res.locals.user = req.user || null;
	if(req.user) {
		res.locals.admin = req.user[0].group === "admin" || null;
		console.log("ADMIN VARIABLE", res.locals.admin)
	}
	next();
});

app.use('/', routes);
app.use('/api', routesApi);

/*Error Handling*/
//custom 404 page
app.use(function(req,res) {
	res.status(404);
	res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});


app.listen(app.get('port'), function() {
	console.log( 'Express started on http:localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})


module.exports = app;









