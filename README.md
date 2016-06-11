Slinger - A Slack Thinger
=========================

User scripts and stylesheets for `Slack.app`.

## Installation

0. Determine which patch to apply to `Slack.app`:

        $ MD5=`md5 -q /Applications/Slack.app/Contents/MacOS/Slack`

0. Apply the patch:

        $ ./bin/patch.py patches/$MD5.patch /Applications/Slack.app/Contents/MacOS/Slack

  (If there is no such patch file, it means there isn't a patch for your
  version of Slack; file an issue!)

0. Re-sign `Slack.app`

        $ codesign -f -s - /Applications/Slack.app/Contents/MacOS/Slack

  (You might need to have Developer Tools installed or something to
  do that, not sure).

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
Probably you can add a certificate to your keychain or something, too
