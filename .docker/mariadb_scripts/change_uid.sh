#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       first_run.sh
# Description:  This script will prepare the container for the first run (if it is the case)
# ------------

NEW_UID=997
NEW_GID=997
USER_NAME='mysql'

groupmod -g $NEW_GID $USER_NAME
usermod -u $NEW_UID -g $NEW_GID $USER_NAME