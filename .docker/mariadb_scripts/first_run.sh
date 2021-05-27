#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       first_run.sh
# Description:  This script will prepare the container for the first run (if it is the case)
# ------------

VOLUME_NAME='unst-database-volume'

if [ "$(docker volume ls --filter name=${VOLUME_NAME} -q | wc -l)" -eq 1 ]; then
  echo "[ INFO ]: The volume exists."
else
  echo "[ ERROR ]: The volume doesn't exist."
fi
