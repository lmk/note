
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log("exports.index : " + req.path)
  res.render('index', {'name': req.params.name || 'default', 
                     'format': req.params.format || 'js'} );
};

