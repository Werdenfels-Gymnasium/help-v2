#!/bin/bash

# Go to the project root directory
cd $(dirname ${0})/..

# Build the help in AOT and production mode.
$(npm bin)/ng build --aot -prod

# Upload app to firebase
$(npm bin)/firebase deploy --token ${HELP_V2_FIREBASE_ACCESS_TOKEN}
