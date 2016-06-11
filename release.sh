# Prep a release in `gh-pages`.
cp src/* build/
cp bin/taut.sh build/
git co gh-pages
cp build/* ./
