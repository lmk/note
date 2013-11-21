var fs = require('fs');
var serverSocket = null;
var dataDir = null;
var contents;


exports.init = function (cfg) {
  serverSocket = cfg.serverSocket;
  dataDir = cfg.dataDir;
  fs.readFile(dataDir + '/a', {encoding: 'utf8'}, function(err, data){
    if (err) console.log(err);
    contents=data;
  });
}

exports.connection = function(socket) {

  socket.emit('recv', { content: contents });

  socket.on('send', function(data){
    if ( data && data.content && contents === data.content ) return;

    console.log('send '+data.content);

    contents = data.content;
    fs.writeFile(dataDir + '/a', contents, {encoding: 'utf8'}, function(err) {
      if (err) console.log(err);
      //console.log(data);
      serverSocket.sockets.emit('recv', { content: contents });
    });
  });
};

