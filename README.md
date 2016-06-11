Slinger - A Slack Thinger
=========================

User scripts and stylesheets for `Slack.app`.

## Installation

    $ ./bin/patch.sh

This will patch `Slack.app` to load <https://zachsnow.github.io/slinger/slinger.js>;
if you'd prefer you can patch it to load any script you'd like. Assuming it is hosted
at `$URL`:

    $ ./bin/patch.sh $URL

See <zachsnow.github.io/slinger/> for more information.

## Use

Start Slack. That's it :)

The default user script, [slinger.js](https://zachsnow.github.io/slinger/slinger.js),
does only a few things.

* It binds two additional shortcuts: `Command + W`, to close the current channel,
  and `Command + P`, to start a call in the current channel).
* Creates a simple Javascript console that is running in the context of the Slack
  `WebView`.

## Development

The easiest way to test development is to load `slinger.js` in the Slack
webapp. Due to browsers and security and all of that nonsense, can't just
load the file via `file:///`; instead you need to serve it (over `https`, of
course).  First run the test server:

    $ ./bin/serve.py
    
Then load the script into the webapp by opening your console and enter the following:

    $.getScript('https://localhost:4443/src/slinger.js');

Oh no, it doesn't work! Because `localhost.pem` is self-signed, you'll need
to first load <https://localhost:4443/src/slinger.js> and tell your browser that it's safe.
Probably you can add a certificate to your keychain or something, too.
