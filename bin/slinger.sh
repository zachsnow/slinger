# Make sure Slack is installed.
SLACK="/Applications/Slack.app/Contents/MacOS/Slack"
if [ ! -f ${SLACK} ];
then
   echo "Error: could not find Slack.app"
   exit -1
fi

# Get latest release.
RELEASE_URL=`curl -s https://api.github.com/repos/zachsnow/slinger/releases | jq --raw-output '.[0].tarball_url'`
RELEASE_BUNDLE="slinger.tar.gz"

echo "Slinger: downloading release ${RELEASE_URL}..."
wget -q -O "${RELEASE_BUNDLE}" "${RELEASE_URL}"
if [ $? -ne 0 ];
then
  echo "Error: chould not download latest release"
  exit -1
fi

# Unzip.
echo "Slinger: extracting release ${RELEASE_BUNDLE}"
SLINGER_DIR="slinger"
mkdir -p ${SLINGER_DIR}
tar -xzf "${RELEASE_BUNDLE}" -C "${SLINGER_DIR}" --strip-components 1

# Find correct patch.
SLACK_MD5=`md5 -q ${SLACK}`
PATCH="${SLINGER_DIR}/patches/${SLACK_MD5}.patch"
if [ ! -f ${PATCH} ];
then
  echo "Error: no patch file for your version of Slack.app (md5: ${SLACK_MD5})"
  exit -1
fi

# Patch.
echo "Slinger: patching..."
"${SLINGER_DIR}/bin/patch.py" "${PATCH}" "${SLACK}" --dry-run
if [ $? -ne 0 ];
then
  echo "Slinger: application of ${SLACK_MD5}.patch failed"
  exit -1
fi


# Fix code signing.
echo "Slinger: signing..."
sudo codesign -f -s - "${SLACK}"
if [ $? -ne 0 ];
  echo "Slinger: re-signing Slack.app failed"
  exit -1
fi

# Clean up; we don't clean up when patch application fails in
# case the user wants to force-apply a patch.
echo "Slinger: cleaning up..."
rm -rf "${SLINGER_DIR}"

echo "Slinger: done!"
exit 0
