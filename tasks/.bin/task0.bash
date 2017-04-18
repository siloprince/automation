#!/bin/bash

GITDIFF=$(git diff --name-only)
if [ "$GITDIFF" =~ test ]
then
    echo $1
fi
