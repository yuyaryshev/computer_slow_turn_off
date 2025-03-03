cls
rm -rf build
node-gyp clean configure
node-gyp build
pause