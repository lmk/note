
/*
 * GET home page.
 */

var loader = require('../controller/server');

var DEFAULT_FONT_SIZE = 16;
var MIN_FONT_SIZE = 8;
var MAX_FONT_SIZE = 72;
var GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

function sendPasswordDenied(res) {
  res.status(403);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(
    '<!DOCTYPE html>' +
    '<html lang="ko"><head><meta charset="utf-8"><title>열 수 없음</title></head>' +
    '<body style="font:14px/1.5 sans-serif;padding:48px">' +
    '<p>비밀번호가 일치하지 않아 페이지를 열 수 없습니다.</p>' +
    '</body></html>'
  );
}

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
  var name = req.params.name || 'default';
  var access = loader.authorize(name, req.query.pwd);
  if (!access.ok) {
    sendPasswordDenied(res);
    return;
  }

  res.render('index', {
    'name': name,
    'format': req.params.format || 'js',
    'sz': parseFontSize(req.query.sz),
    'gaId': getGaMeasurementId()
  });
};

