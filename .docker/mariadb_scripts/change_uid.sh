#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       change_uid.sh
# Description:  This script will change the UID and GID of a given user.
# ------------

NEW_UID=997
NEW_GID=997
USER_NAME='mysql'

current_gid=$(id -g $USER_NAME)
current_uid=$(id -u $USER_NAME)

if [[ "$current_gid" != "$NEW_GID" ]]; then
  groupmod -g $NEW_GID $USER_NAME
  echo "Changed GID"
fi

if [[ "$current_uid" != "$NEW_UID" ]]; then
  usermod -u $NEW_UID -g $NEW_GID $USER_NAME
  echo "Changed GID"
fi
