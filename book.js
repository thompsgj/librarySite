var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')

var monk = require('monk');
var db = monk('localhost:27017/bookdb');
require('./app_api/models/db.js');
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

app.use('/', routes);
app.use('/api', routesApi);



app.listen(app.get('port'), function() {
	console.log( 'Express started on http:localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})


module.exports = app;






