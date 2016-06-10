(function(){
  'use strict';

  // patch: 0x8032F => $.getScript('//rawgit.com/zachsnow/taut/master/taut.js') ;
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

  /////////////////////////////////////////////////////////////////////
  // Extra shortcuts.
  /////////////////////////////////////////////////////////////////////
  log('binding shortcuts...');

  // leave: leave the current room; like /leave but tries to verify
  // that you actually want to leave in some cases.
  var leave = function(){
    var model = TS.shared.getActiveModelOb();
    if(!model){
      log('leave: no active model');
      return;
    }
    if(model.is_im){
      log('leave: leaving current IM');
      TS.client.ui.maybePromptForClosingIm(model.id)
    }
    else if(model.is_mpim){
      log('leave: leaving current MPIM');
      TS.mpims.closeMpim(model.id);
    }
    else if(model.is_group){
      log('leave: leaving current group');
      TS.client.ui.maybePromptForClosingGroup(model.id);
    }
    else if(model.is_channel){
      log('leave: leaving current channel');
      TS.channels.leave(model.id);
    }
    else {
      log('leave: unknown model type', model);
    }
  };

  // Bind Command+W to leave.
  TS.key_triggers[87] = {
    func: leave,
    no_shift: true
  };

  // startCall: try to start a call in your current room/channel/etc.
  var startCall = function(){
    var model = TS.shared.getActiveModelOb();
    if(!model){
      log('startCall: no active model');
      return;
    }
    var callInfo = {
      id: model.id,
      is_dm: model.is_im,
      is_mpdm: model.is_mpim
    };
    log('startCall: launching...', callInfo)
    TS.utility.calls.launchVideoCall(callInfo);
  };

  // Bind Command+P to startCall.
  TS.key_triggers[80] = {
    func: startCall,
    no_shift: true
  };

  log('loaded');

  // Ok, we're done.
  window.TSSSB.teamsDidLoad && window.TSSSB.teamsDidLoad();

  // Export.
  window.taut = {
    log: log
  };
})();
