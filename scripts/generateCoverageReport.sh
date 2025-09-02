#!/usr/bin/env bash

npx istanbul-merge --out coverage/coverage-final.json ./coverage/**/coverage-final.json
echo "Coverage reports merged"

rm -Rf coverage-html
npx nyc report --reporter html -t coverage --report-dir coverage-report
echo "Coverage report built"
