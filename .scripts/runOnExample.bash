#!/usr/bin/env bash
echo cloning
git clone --depth=1 https://github.com/TheBrainFamily/cypress-cucumber-example.git

cd cypress-cucumber-example
echo cd cypress-cucumber-example
npm install
echo npm install
rm -rf node_modules/cypress-cucumber-preprocessor
npm link cypress-cucumber-preprocessor
echo npm link cypress-cucumber-preprocessor
npm run test
echo npm run test
