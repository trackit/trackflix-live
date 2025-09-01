#!/usr/bin/env bash

rm -Rf allure-merged-results

find . -name 'allure-results' -print0 |
    while IFS= read -r -d '' line; do
        echo "Found $line"
        rm -Rf "$line"
    done

