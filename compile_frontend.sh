set -xeu
vite build
echo "Copying to Django..."
mkdir -p ./web/templates
mv ./dist/index.html ./web/templates/index.html
mkdir -p ./web/static/frontend
rm -rf ./web/static/frontend/assets
mv ./dist/assets ./web/static/frontend/assets
rmdir ./dist
echo "Copied successfully!"
