
/*
 * GET home page.
 */

var DEFAULT_FONT_SIZE = 16;
var MIN_FONT_SIZE = 8;
var MAX_FONT_SIZE = 72;

function parseFontSize(sz) {
  var n = parseInt(sz, 10);
  if (isNaN(n)) return DEFAULT_FONT_SIZE;
  if (n < MIN_FONT_SIZE) return MIN_FONT_SIZE;
  if (n > MAX_FONT_SIZE) return MAX_FONT_SIZE;
  return n;
}

exports.index = function(req, res){
  console.log("exports.index : " + req.path)
  res.render('index', {
    'name': req.params.name || 'default',
    'format': req.params.format || 'js',
    'sz': parseFontSize(req.query.sz)
  });
};

