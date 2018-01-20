#!/usr/bin/env bash
SLINGER_DIR=$(cd `dirname $(dirname $0)` && pwd)

# Make sure Slack is installed.
echo "slinger: finding Slack.app..."
SLACK_DIR="/Applications/Slack.app/"
if [ ! -d ${SLACK_DIR} ]; then
   echo "slinger: could not find Slack.app"
   exit -1
fi

# Find correct patch.
echo "slinger: finding patch..."
RESOURCES="/Applications/Slack.app/Contents/Resources/"
ASAR="/Applications/Slack.app/Contents/Resources/app.asar"
ASAR_MD5=`md5 -q ${ASAR}`
PATCH="${SLINGER_DIR}/patches/${ASAR_MD5}.patch"
if [ ! -f "${PATCH}" ]; then
  echo "slinger: no patch file for your version of Slack.app asar (md5: ${ASAR_MD5})."
  exit -1
fi
echo "slinger: found path ${PATCH}"

# Configure patch.
URL="https://zachsnow.github.io/slinger/slinger.js"
if [[ "$1" != "" ]]; then
  URL="$1"
fi

# Extract asar.
echo "slinger: extracting asar..."
cd "${RESOURCES}" && asar extract "${ASAR}" "${ASAR}.unpacked"

# Patch.
cd "${ASAR}.unpacked" && bash "${PATCH}" "${URL}"
if [ $? -ne 0 ]; then
  echo "slinger: application of ${ASAR_MD5}.patch failed."
  exit -1
fi

# Pack asar.
echo "slinger: packing asar..."
cd "${RESOURCES}" && asar pack "${ASAR}.unpacked" "${ASAR}"

echo "slinger: done"
exit 0
