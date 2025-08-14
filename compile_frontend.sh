set -xeu
vite build
echo "Copying to Django..."
mv ./dist/index.html ./web/templates/index.html
rm -rf ./web/static/frontend/assets
mv ./dist/assets ./web/static/frontend/assets
rmdir ./dist
echo "Copied successfully!"
