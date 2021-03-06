# Get latest release.
RELEASE_URL=`curl -s https://api.github.com/repos/zachsnow/slinger/releases/latest | grep tarball_url | head -n 1 | cut -d '"' -f 4`
RELEASE_BUNDLE="slinger.tar.gz"

echo "slinger: downloading release ${RELEASE_URL}..."
wget -q -O "${RELEASE_BUNDLE}" "${RELEASE_URL}"
if [ $? -ne 0 ];
then
  echo "slinger: chould not download latest release."
  exit -1
fi

# Unzip.
echo "Slinger: extracting release ${RELEASE_BUNDLE}..."
SLINGER_DIR="slinger"
mkdir -p ${SLINGER_DIR}
tar -xzf "${RELEASE_BUNDLE}" -C "${SLINGER_DIR}" --strip-components 1

# Patch.
bash "${SLINGER_DIR}/bin/patch.sh" $1
