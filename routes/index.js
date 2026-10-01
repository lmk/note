
/*
 * GET home page.
 */

var DEFAULT_FONT_SIZE = 16;
var MIN_FONT_SIZE = 8;
var MAX_FONT_SIZE = 72;
var GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

function getGaMeasurementId() {
  var id = process.env.GA_MEASUREMENT_ID;
  if (!id) return '';
  if (!GA_ID_PATTERN.test(id)) {
    console.warn('GA_MEASUREMENT_ID is set but is not a GA4 measurement ID; gtag omitted');
    return '';
  }
  return id;
}

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
    'sz': parseFontSize(req.query.sz),
    'gaId': getGaMeasurementId()
  });
};

