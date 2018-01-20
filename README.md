Slinger - A Slack Thinger
=========================

User scripts and stylesheets for `Slack.app`.

# This is mostly unnecessary for new versions of Slack.

First off: there's no real need to patch the app if you don't want to; simply
run `/Slack.app/Contents/MacOS/Slack --dev` and to enable Developer Tools. Then
click View > Developer > Toggle Webapp DevTools to open them. Finally, you can
load whatever JS or CSS you like:

    $.getScript("https://example.com/my-neat-script.js");

Minor caveat: the script *must* be served via `https`.

However, if you want Slack load your user scripts and stylesheets every time you
open the app or join a new workspace, you can patch `Slack.app` to do just that.

## Installation

**NOTE:** The following is out of date for new versions of Slack!

    $ ./bin/patch.sh

This will patch `Slack.app` to load <https://zachsnow.github.io/slinger/slinger.js>;
if you'd prefer you can patch it to load any script you'd like. Assuming it is hosted
at `$URL`:

    $ ./bin/patch.sh $URL

See <https://zachsnow.github.io/slinger/> for more information.

## Use

Start Slack. That's it :)

The default user script, [slinger.js](https://zachsnow.github.io/slinger/slinger.js),
does only a few things.

* It binds two additional shortcuts: `Command + W`, to close the current channel,
  and `Command + P`, to start a call in the current channel.
* It creates a simple Javascript console that is running in the context of the Slack
  `WebView`.

## Development

The easiest way to test development is to load `slinger.js` in the Slack
webapp. Due to browsers and security and all of that nonsense, can't just
load the file via `file:///`; instead you need to serve it (over `https`, of
course).  First run a server:

    $ python -m SimpleHTTPServer
    
Then load the script into the webapp by opening your console and enter the following:

    $.getScript('http://localhost/src/slinger.js');

Oh no, it doesn't work! Because the web application is loaded over `https`,
the `WebView` refuses to load an insecure resource. We can disable this by modifying
the Slack `Info.plist`.  Add the following:

    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <string>YES</string>
    </dict>

Now we've broken the signature for `Slack.app`, so we must re-sign it:

    $ codesign -f -s - /Applications/Slack.app

Now you should be able to load it locally. Sadly, I wasn't able to determine how to
tell the `WebView` that it can load a local file without completely disabling web
security.
