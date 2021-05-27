FROM mariadb:latest

LABEL author="Ionuț Roșca <ionut.rosca@info.uaic.ro>"
LABEL version="0.3.1"

# Get the root password for the database as an argument from docker-compose
ARG ROOT_PASSWORD
ENV MARIADB_ROOT_PASSWORD ${ROOT_PASSWORD}

COPY ./.docker/mariadb_scripts /mariadb_scripts
RUN chmod +rx /mariadb_scripts/*.sh
EXPOSE 3306