var editor;

$(document).ready(function(){
  var socket = io.connect('http://m.newtype.pe.kr:8080');

  socket.emit('init', info);
  socket.on('initAck', function(data){
    info.id = data.id;

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/" + getFileType(document.URL.split('.').pop()));
    editor.getSession().setTabSize(2);

    editor.getSession().setValue(data.content);
    editor.moveCursorToPosition( data.position );

    $('#editor').keyup(function(){
       var position = editor.getCursorPosition();
       var tid = '' + info.id + new Date().getTime();
 
       socket.emit('send', {
         'tid': tid,
         'owner': info.id,
         'document': info.document,
         'content': editor.getSession().getValue(),
         'position': {
           'row': position.row,
           'column': position.column
         }
       });
   });

   if ( data.position ) editor.moveCursorToPosition( data.position );
  });

  socket.on('recv', function(data){
    /* 내가 요청한 content를 갱신할 필요 없다. */
    if ( data && data.owner && data.owner !== info.id ) {
      if ( data && editor.getSession().getValue() !== data.content ) {
        editor.getSession().setValue(data.content);
      }

      if ( data && data.position ) {
        editor.moveCursorToPosition( data.position );
      }
    }
  });

});
