#!/usr/bin/env bash
SLINGER_DIR=`dirname $(dirname $0)`

# Allow forcing.
if [[ "$1" == "--force" ]]; then
  FORCE="$1"
  shift
fi

# Make sure Slack is installed.
SLACK="/Applications/Slack.app/Contents/MacOS/Slack"
if [ ! -f ${SLACK} ];
then
   echo "slinger: could not find Slack.app"
   exit -1
fi

# Find correct patch.
SLACK_MD5=`md5 -q ${SLACK}`
PATCH="${SLINGER_DIR}/patches/${SLACK_MD5}.patch"
if [ ! -f ${PATCH} ];
then
  echo "slinger: no patch file for your version of Slack.app (md5: ${SLACK_MD5})."
  #exit -1
fi
PATCH="${SLINGER_DIR}/patches/7b0bc53e419c44c93a4b9ffee18e114e.patch"

# Configure patch.
URL="https://zachsnow.github.io/slinger/slinger.js"
if [[ "$1" != "" ]]; then
  URL="$1"
fi

# Patch.
echo "slinger: patching..."
python "${SLINGER_DIR}/bin/patch.py" "${FORCE}" "${PATCH}" "${SLACK}" URL="${URL}"
if [ $? -ne 0 ];
then
  echo "slinger: application of ${SLACK_MD5}.patch failed."
  exit -1
fi

# Fix code signing.
echo "Slinger: signing..."
sudo codesign -f -s - "${SLACK}"
if [ $? -ne 0 ];
then
  echo "slinger: re-signing Slack.app failed."
  exit -1
fi

echo "slinger: done"
exit 0
