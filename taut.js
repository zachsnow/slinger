(function(){
  'use strict';
  alert('taut');

  // patch: 0x8032F => $.getScript('//rawgit.com/zachsnow/taut/master/taut.js') ;
  //                   window.TSSSB ? TSSSB.teamsDidLoad() : '';
  var version = "0.0.1";
  var stylesUrl = '//rawgit.com/zachsnow/taut/master/taut.css';
  //var stylesUrl = '//localhost:4443/taut.css';

  /////////////////////////////////////////////////////////////////////
  // Logging.
  /////////////////////////////////////////////////////////////////////
  var $taut = $(
    '<div id="taut" style="display: none;">' +
    '<pre id="log"></pre>' +
    '<input type="text" id="console">' +
    '</div>'
  );
  $('#taut').remove();
  $('body').append($taut);

  var $log = $taut.find('#log');
  var $console = $taut.find('#console');

  var stringify = function(object){
    if(_.isObject(object)){
      return JSON.stringify(object);
    }
    return object.toString();
  }

  var write = function(){
    if(!$log.length){
      return;
    }
    var text = $log.text();
    text += _.map(arguments, stringify).join(' ') + '\n';
    $log.text(text);
    $log.scrollTop($log[0].scrollHeight);
  };
  var log = function(){
    var args = _.toArray(arguments);
    args.unshift('taut:');
    write.apply(this, args);
  };
  log('loading version ' + version + '...');

  /////////////////////////////////////////////////////////////////////
  // Console.
  /////////////////////////////////////////////////////////////////////
  var commands = [];
  var currentCommand = 0;
  $console.on('keypress', function(e){
    if(e.which === 13){
      var command = $console.val();
      $console.val('');
      var result;
      try {
        result = eval(command);
      }
      catch(e){
        result = e;
      }
      write('>', _.isUndefined(result) ? '' : result);
      commands.push(command);
      currentCommand = commands.length;
      return;
    }
  });

  $console.on('keydown', function(e){
    if(e.which === 38){
      currentCommand -= 1;
      if(currentCommand < 0){
        currentCommand = commands.length;
      }
      $console.val(commands[currentCommand] || '');
      return;
    }
    if(e.which === 40){
      currentCommand += 1;
      if(currentCommand > commands.length){
        currentCommand = 0;
      }
      $console.val(commands[currentCommand] || '');
      return;
    }
    if(e.which === 27){
      currentCommand = commands.length;
      $console.val('');
    }
  });

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

  // Bind Command+W to leave, except when we're not really
  // in the Slack app.
  TS.key_triggers[window.TSSSB.env.desktop_app_version ? 87 : 88] = {
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
