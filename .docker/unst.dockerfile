FROM node:16

LABEL author="Ionuț Roșca <ionut.rosca@info.uaic.ro>"
LABEL version="0.3.2"

# Create the app's folder on the container
WORKDIR /usr/share/src/app

# Ensure that both package.json and package-lock.json are copied
COPY ./package*.json ./

# Copy and mark as executable the scripts that will be run on the container
COPY ./.docker/unst_scripts ./unst_scripts
RUN chmod +rx unst_scripts/*.sh

# Copy the certificate files for enabling HTTPS
COPY /etc/ssl/reloadedd.me/* /etc/ssl/

RUN npm ci

# Copy the contents of the whole repostory to the current directory (WORKDIR from above) of the container
COPY . .
EXPOSE 2999

# Instead of directly running the Node.js server, run a Bash script that will make sure to wait for the database to
# come alive
CMD ["bash", "unst_scripts/wait_for_database.sh"]