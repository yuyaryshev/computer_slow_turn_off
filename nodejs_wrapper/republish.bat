rm -rf build
cp ../src/ScreenDimmer.* src
cp ../src/utilFuncs.* src
pnpm build && npm publish
