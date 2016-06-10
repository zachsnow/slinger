Taut
====

## Installation

./patch.sh /Applications/Slack.app/Contents/MacOS/Slack

## Use

Start Slack. That's it.

## Development

The easiest way to test development is to load `taut.js` in the Slack
webapp. Due to browsers and security and all of that nonsense, can't just
load the file via `file:///`; instead you need to serve it (over `https`, of
course).  First run the server:

    $ ./serve.py
    
Then load the script into the webapp by opening your console and enter the following:

    $.getScript('https://localhost:4443/taut.js');

