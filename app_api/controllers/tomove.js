
//GET HOME PAGE START
app.get('/', function(req,res) {
	res.render('home');
});
//GET HOME PAGE END



//GET ANALYTICS PAGE START
app.get('/analytics', function(req,res) {
	//res.render('analytics');
	var db = req.db;
	var collection = db.get('bookcollection');

	

	var query = {"genre" : "Sci-Fi"}

	collection.find(query,{},function(e,docs) {
		res.render('analytics', {
			function() {
				console.log("hi")
			}
		});
	});
});
//GET ANALYTICS PAGE END


app.get('/thanks', function(req,res) {
	res.render('thanks');
});

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


/* Log Listening */
app.listen(app.get('port'), function() {
	console.log( 'Express started on http:localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})