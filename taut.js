(function(){
  'use strict';

  // patch: 0x8032F => $.getScript('//localhost:4443/taut.js') ;

  //                   window.TSSSB ? TSSSB.teamsDidLoad() : '';
  // rawgit.com/zachsnow/taut/master/taut.js
  var version = "0.0.1";
  var stylesUrl = 'https://localhost:4443/taut.css';

  /////////////////////////////////////////////////////////////////////
  // Logging.
  /////////////////////////////////////////////////////////////////////
  var $log = $('<textarea id="taut" style="display: none;" readonly="readonly"></textarea>');
  if(!$('#taut').length){
    $('body').append($log);
  }
  var log = function(){
    if(!$log){
      return;
    }
    var text = $log.val();
    text += 'taut: ' + _.map(arguments, function(arg){
      if(_.isObject(arg)){
        return JSON.stringify(arg);
      }
      return arg.toString();
    }).join(', ') + '\n';
    $log.val(text);
    $log.scrollTop($log[0].scrollHeight);
  };
  log('loading version ' + version + '...');

  /////////////////////////////////////////////////////////////////////
  // Styles.
  /////////////////////////////////////////////////////////////////////
  log('loading styles...');
  $('<link/>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: stylesUrl
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
