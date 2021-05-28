#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       wait_for_database.sh
# Description:  This script will do a check-sleep loop several times, giving the database time to come alive.
# ------------

MAX_RETRIES=5
WAITING_TIME=3

function waitForDatabase() {
  attempt=1

  while [ ${attempt} -le ${MAX_RETRIES} ]; do
    if ! ping -c 1 mariadb 2> /dev/null; then
      echo "[ DEBUG ]: Waiting for MariaDB container, attempt #${attempt}"
      ((attempt++))
      sleep ${WAITING_TIME}
    else
      # This means that the database container is reachable, so let's start the Node.js app
      node server.js
      exit 255
    fi
  done
}

sleep ${WAITING_TIME}

# Run it!
waitForDatabase
