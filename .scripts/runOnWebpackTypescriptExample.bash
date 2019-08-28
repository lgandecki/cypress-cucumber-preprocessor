#!/usr/bin/env bash
git clone --depth=1 https://github.com/TheBrainFamily/cypress-cucumber-webpack-typescript-example.git

cd cypress-cucumber-webpack-typescript-example
npm install
rm -rf node_modules/cypress-cucumber-preprocessor
npm link cypress-cucumber-preprocessor
npm run test
