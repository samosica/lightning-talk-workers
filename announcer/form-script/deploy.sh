#!/usr/bin/env bash

CLASP_FILE=$1

cp "$CLASP_FILE" .clasp.json
npx clasp push
rm .clasp.json
