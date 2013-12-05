
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {'name': req.params.name || 'default', 
                     'format': req.params.format || 'js'} );
};

