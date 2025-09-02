#!/usr/bin/env bash

dirname=$(dirname "$0")

bash "$dirname/generateAllureReport.sh"
bash "$dirname/generateCoverageReport.sh"

rm -Rf final-report
mkdir final-report
cp -r allure-report final-report
cp -r coverage-report final-report
cp assets/reports.html final-report/index.html

echo "Merged report built"
