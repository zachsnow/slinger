Slinger - A Slack Thinger
=========================

User scripts and stylesheets for `Slack.app`.

## Installation

See <zachsnow.github.io/slinger/> for more information.

## Use

Start Slack. That's it.

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
Probably you can add `localhost.pem` to your keychain or something, too.
