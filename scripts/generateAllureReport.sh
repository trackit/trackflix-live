#!/usr/bin/env bash

rm -Rf allure-merged-results
mkdir allure-merged-results

find . -name 'allure-results' -print0 |
    while IFS= read -r -d '' line; do
        echo "Found $line"
        cp "$line"/* allure-merged-results
    done

npx allure generate ./allure-merged-results -o ./allure-report --clean
