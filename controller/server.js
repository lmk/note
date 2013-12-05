
var fs = require('fs');
var io = null;
var dataDir = null;
var notes = [];

/* @brif Get Index in notes Array by Name
 * @param[in] name name
 * @retval index
 */
function getNoteIdByName(name) {
  for(var i in notes) {
    if( notes[i].name === name ) return i;
  }

  return -1;
}

/* @brif server initinailize 
 * @param[in] cfg option
 * @remark default load
 */
exports.init = function (cfg) {
  io = cfg.io;
  dataDir = cfg.dataDir;
}

exports.connection = function(socket){

  socket.on('disconnect', function(){
    socket.get('noteId', function(error, noteId){
      if (error) console.log(error);
      try {
        socket.leave(''+noteId);
      } catch(e) {
        console.log(e);
      }
    });
  });

  socket.on('init', function(data){

    var note;

    // notes check
    var noteId = getNoteIdByName(data.name);

    if ( noteId === -1 ) {

      noteId = notes.length;

      note = new Object({
        id: noteId,
        name:  data.name,
        position: {row:0, col:0},
        content: ''
      });

      note.id = noteId;
      note.name = data.name;
      note.position = new Object({row:0, col:0});
      note.content = '';

      notes.push(note);
    } else {
      note = notes[noteId];
    };
    
    // grouping page name 
    socket.join(''+noteId);
    socket.set('noteId', noteId);

    // data file open
    fs.readFile(dataDir+'/'+data.name+'.pos'
      , {'encoding': 'utf8'}
      , function(error, data){
          if ( error ) console.log(error);
          if ( data ) notes[noteId].position = JSON.parse(data);
    });

    fs.readFile(dataDir+'/'+data.name+'.dat'
      , {'encoding': 'utf8'}
      , function(error, data){
          if ( error ) console.log(error);
          if ( data ) {
            notes[noteId].content = data;
          }

          socket.emit('initAck', { 
            'id': socket.id, 
            'content': notes[noteId].content,
            'position': notes[noteId].position
          });
    });
  });

  socket.on('send', function(data){
    socket.get('noteId', function(error, noteId){
      var note = notes[noteId];
      if ( data.position ) {
        note.position = data.position;  
        fs.writeFile(dataDir + '/' + note.name + '.pos'
          , JSON.stringify( note.position, null, 2)
          , {'encoding': 'utf8'},
          function(error) {
            if (error) console.log(error);
        });
      }

      /* content가 바뀌면 저장 */
      if ( data.content && note.content !== data.content ){
        note.content = data.content; 
        fs.writeFile(dataDir + '/' + note.name + '.dat'
          , note.content
          , {'encoding': 'utf8'}
          , function(error){
          if (error) console.log(error);
        });

        io.sockets.in(''+noteId).emit('recv', data);
      }
    });
  });
};

