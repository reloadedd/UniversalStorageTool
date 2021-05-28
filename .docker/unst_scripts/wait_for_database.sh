#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       wait_for_database.sh
# Description:  This script will do a check-sleep loop several times, giving the database time to come alive.
# ------------

MAX_RETRIES=5
WAITING_TIME=3
INITIAL_WAITING_TIME=10
DATABASE_SERVER_HOSTNAME='unst-mariadb'

function waitForDatabase() {
  attempt=1

  while [ ${attempt} -le ${MAX_RETRIES} ]; do
    if ! ping -c 1 ${DATABASE_SERVER_HOSTNAME} 2> /dev/null; then
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

# First time after booting up it will take a bit longer (especially if that is the time when the volumes
# are created)
sleep ${INITIAL_WAITING_TIME}

# Run it!
waitForDatabase
