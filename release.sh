# Prep a release in `gh-pages`.
cp src/* build/
cp bin/slinger.sh build/
git co gh-pages
cp build/* ./
