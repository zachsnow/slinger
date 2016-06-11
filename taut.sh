# Get latest release.
URL=`curl -s https://api.github.com/repos/porjo/staticserve/releases/latest | jq --raw-output '.assets[0] | .browser_download_url'`
wget ${URL}

# Unzip.

# Patch Slack.
MD5=`md5 $1`
PATCH="${MD5}.patch"
./patch.py ${PATCH} $1

# Fix code signing.
sudo codesign -f -s - $1
