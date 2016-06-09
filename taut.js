(function(){
  console.log('taut: loaded shim');

  console.log('taut: loading styles');
  $('<link/>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: '//localhost:4443/taut.css'
  }).appendTo('head');

  console.log('taut: binding shortcuts');

  var leaveChannel = function(){
    var model = TS.shared.getActiveModelOb();
    if (!model){
      return;
    }
    TS.channels.leave(model.id);
    e.preventDefault();
  };

  $(window.document).keydown(function(e){
    if(TS.utility.cmdKey(e) && e.which == 87){
      leaveChannel();
    }
  });
})();
