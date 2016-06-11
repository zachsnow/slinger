# Make sure Slack is installed.
SLACK="/Applications/Slack.app/Contents/MacOS/Slack"
if [ ! -f $SLACK ];
then
   echo "Error: could not find Slack.app"
fi

# Get latest release.
URL=`curl -s https://api.github.com/repos/zachsnow/slinger/releases/latest | jq --raw-output '.assets[0] | .browser_download_url'`
wget ${URL}

# Unzip.

# Patch Slack.
MD5=`md5 -q $SLACK`
PATCH="${MD5}.patch"
./patch.py ${PATCH} $1

# Fix code signing.
sudo codesign -f -s - $1
