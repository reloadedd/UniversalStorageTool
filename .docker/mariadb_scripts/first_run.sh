#!/bin/bash

# ------------
# Author:       Ionuț Roșca
# Script:       first_run.sh
# Description:  This script will prepare the container for the first run (if it is the case)
# ------------

SQL_SCRIPT_NAME='create_database.sql'

cat <<EOF > $SQL_SCRIPT_NAME
CREATE USER '${UNST_DATABASE_USER}'@'%' IDENTIFIED BY '${UNST_DATABASE_PASSWORD}';
CREATE DATABASE ${UNST_DATABASE_NAME};
GRANT ALL ON ${UNST_DATABASE_NAME}.* TO '${UNST_DATABASE_USER}'@'%';
EOF
