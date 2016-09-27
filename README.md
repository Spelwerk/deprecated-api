# Spelwerk API

## Setup

- Run ```npm install``` in the project folder for dependencies before you can start using the api. There may be some extra requirements for your server to run bcrypt. Consult the bcrypt documentation to know more.
- Setup the mysql server and import the sql-file into a new database. The sql-file can be found in the installation folder.
- Type database connection information into ```/app/config.js```.
- Type api keys into ```/app/config.js```.
- Type port number into ```/app/config.js```.
- Type password hashing secrets into ```/app/config.js```.
- Type password hashing salt rounds into ```/app/config.js```. It is recommended to keep the password hashed at ~1000ms. Experiment a bit.
- Run the server with ```npm start``` in root folder, or set up as systemd service with the help of the .service file in the installation folder.

## Database Export

The database model is displayed as an image in the installation folder.

## /help

When your API is up and running, you will always be able to find query help by using the api route /api/<route>/help.