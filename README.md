# Spelwerk API

## Setup

- Run ```npm install``` in the project folder for dependencies before you can start using the api. There may be some extra requirements for your server to run bcrypt. Consult the bcrypt documentation to know more.
- Setup the mysql server and import the sql-file into a new database. The sql-file can be found in the installation folder.
- Run "node /installation/create_config.js to bootstrap the configuration file with hashed and secure keys".
- Type all the required information into ```/app/config.js```.
- Run the server with ```npm start``` in root folder, or set up as systemd service with the help of the .service file in the installation folder.
- Run "node /installation/create_admin.js" when you have verified a database connection.

## Database Export

The database model is displayed as an image in the installation folder.

## /help

When your API is up and running, you will always be able to find query help by using the api route /api/<route>/help.