var editor;

$(document).ready(function(){
  var socket = io.connect('/');

  socket.emit('init', info);
  socket.on('initAck', function(data){
    info.id = data.id;

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.setFontSize(info.sz || 16);
    editor.getSession().setMode("ace/mode/" + getFileType(document.URL.split('.').pop()));
    editor.getSession().setTabSize(2);

    var content = (data && data.content != null) ? data.content : '';
    var position = {
      row: (data.position && data.position.row) || 0,
      column: (data.position && (data.position.column != null ? data.position.column : data.position.col)) || 0
    };

    editor.getSession().setValue(content);
    editor.moveCursorToPosition(position);

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
  });

  socket.on('recv', function(data){
    /* 내가 요청한 content를 갱신할 필요 없다. */
    if ( data && data.owner && data.owner !== info.id ) {
      if ( typeof data.content === 'string' && editor.getSession().getValue() !== data.content ) {
        editor.getSession().setValue(data.content);
      }

      if ( data.position ) {
        editor.moveCursorToPosition({
          row: data.position.row || 0,
          column: (data.position.column != null ? data.position.column : data.position.col) || 0
        });
      }
    }
  });

});
