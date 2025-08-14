cp ./dist/index.html ./web/templates/index.html
rm -rf ./web/static/frontend/assets
cp -r ./dist/assets ./web/static/frontend/assets
