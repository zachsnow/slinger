(function(){
  'use strict';

  var debug = true;
  var version = "0.2.0";

  var stylesUrl = '//zachsnow.github.io/slinger/slinger.css';

  // Because sometimes things break and you can't tell if the script
  // is even loading in the Slack app.
  if(debug){
    alert('slinger version ' + version);
  }

  var inApp = false;
  if(window.TSSSB && window.TSSSB.env){
    inApp = window.TSSSB.env.mac_ssb_version || window.TSSSB.env.win_ssb_version;
  }

  /////////////////////////////////////////////////////////////////////
  // Logging.
  /////////////////////////////////////////////////////////////////////
  var $slinger = $(
    '<div id="slinger" style="display: none;">' +
    '<pre id="log"></pre>' +
    '<input type="text" id="console" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">' +
    '</div>'
  );
  $('#slinger').remove();
  $('body').append($slinger);

  var $log = $slinger.find('#log');
  var $console = $slinger.find('#console');

  var stringify = function(object){
    if(_.isObject(object) && !(object instanceof Error)){
      return JSON.stringify(object, null, 2);
    }
    return object.toString();
  };

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
    args.unshift('slinger:');
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
    var model = TS.shared.legacyGetActiveModelOb();
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
  var bindings = {
    87: {
      func: leave,
      no_shift: true
    }
  };

  var getFromCode = TS.key_triggers.getFromCode;
  TS.key_triggers.getFromCode = function t(i){
    var ii = TS.interop.i18n.keyCodeEquivalent(i, {useReverseMap:true}).toString();
    var binding = bindings[ii];
    return binding || getFromCode(i);
  };

  log('loaded');

  // Export.
  window.slinger = {
    log: log
  };
})();
