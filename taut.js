(function(){
  // rawgit.com/zachsnow/taut/master/taut.js
  alert('taut: loaded');
  console.log('taut: loaded shim');

  console.log('taut: loading styles');
  $('<link/>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: '//rawgit.com/zachsnow/taut/master/taut.css'
  }).appendTo('head');

  console.log('taut: binding shortcuts');
  var leave = function(e){
    var model = TS.shared.getActiveModelOb();
    if(!model){
      return;
    }
    if(model.is_im){
      TS.client.ui.maybePromptForClosingIm(im.id)
    }
    else if(model.is_mpim){
      TS.mpims.closeMpim(model.id);
    }
    else if(model.is_group){
      TS.client.ui.maybePromptForClosingGroup(model.id);
    }
    else if(model.is_channel){
      TS.channels.leave(model.id);
    }
    else {
      console.log('taut: unable to leave', model);
      return;
    }

    // Only prevent default if we handled it.
    e.preventDefault();
  };

  var startCall = function(e){
    var model = TS.shared.getActiveModelOb();
    if(!model){
      return;
    }
    var callInfo = {
      id: model.id,
      is_dm: model.is_im,
      is_mpdm: model.is_mpim
    };
    TS.utility.calls.launchVideoCall(callInfo);
    e.preventDefault();
  };

  $(window.document).keydown(function(e){
    if(TS.utility.cmdKey(e) && e.which === 87){
      leave(e);
      return;
    }

    if(TS.utility.cmdKey(e) && e.which === 80){
      startCall(e);
      return;
    }
  });
})();
