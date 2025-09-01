#!/usr/bin/env bash

npx istanbul-merge --out coverage/coverage-final.json ./coverage/**/coverage-final.json
npx nyc report --reporter html -t coverage --report-dir coverage-html
