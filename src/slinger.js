(function(){
  'use strict';

  var debug = false;
  var version = "0.2.0";

  // Because sometimes things break and you can't tell if the script
  // is even loading in the Slack app.
  if(debug){
    alert('slinger version ' + version);
  }

  var inApp = window.TSSSB && window.TSSSB.env && window.TSSSB.envdesktop_app_version;

  /////////////////////////////////////////////////////////////////////
  // Little link for fun.
  /////////////////////////////////////////////////////////////////////
  var $slinger = $(`
    <div id="slinger" style="display: none;">
      <style>
        #slinger {
          display: block !important;
          position: absolute;
          z-index: 100000;
          left: 5px;
          width: 210px;
          height: 20px;
          bottom: 5px;
          background: #78bbe7;
          border: 1px solid white;
          color: white;
          font-family: Monaco,Menlo,Consolas,"Courier New",monospace;
          font-size: 10px;
          text-align: center;
        }

        #slinger a {
            pointer: cursor;
            color: white;
            line-height: 20px;
            font-weight: bold;
            text-decoration: none;
        }

        #slinger:hover a {
            text-decoration: underline;
        }

        #channels_scroller {
            padding-bottom: 50px;
        }
      </style>
      <a href="https://zachsnow.github.io/slinger/">Slinger v${version} &raquo;</a>
    </div>
  `);
  $('#slinger').remove();
  $('body').append($slinger);

  /////////////////////////////////////////////////////////////////////
  // Extra shortcuts.
  /////////////////////////////////////////////////////////////////////
  console.log('slinger: binding shortcuts...');

  // leave: leave the current room; like /leave but tries to verify
  // that you actually want to leave in some cases.
  var leave = function(){
    var model = TS.shared.legacyGetActiveModelOb();
    if(!model){
      console.log('slinger: leave: no active model');
      return;
    }
    if(model.is_im){
      console.log('slinger: leave: leaving current IM');
      TS.client.ui.maybePromptForClosingIm(model.id)
    }
    else if(model.is_mpim){
      console.log('slinger: leave: leaving current MPIM');
      TS.mpims.closeMpim(model.id);
    }
    else if(model.is_group){
      console.log('slinger: leave: leaving current group');
      TS.client.ui.maybePromptForClosingGroup(model.id);
    }
    else if(model.is_channel){
      console.log('slinger: leave: leaving current channel');
      TS.channels.leave(model.id);
    }
    else {
      console.log('slinger: leave: unknown model type', model);
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

  // `TS.key_triggers` no longer has a public interface for adding
  // shortcuts, so we have to hack it in.
  var getFromCode = TS.key_triggers.getFromCode;
  TS.key_triggers.getFromCode = function t(i){
    var ii = TS.interop.i18n.keyCodeEquivalent(i, {useReverseMap:true}).toString();
    var binding = bindings[ii];
    return binding || getFromCode(i);
  };

  console.log('slinger: loaded');
})();
