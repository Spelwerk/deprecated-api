# Spelwerk API

## Git

- ```git init```
- ```git remote add origin git@github.com:Spelwerk/spelwerk-api.git```
- ```git pull git@github.com:Spelwerk/spelwerk-api.git master```

## Setup

- Create the folder ```/logs/``` and set chmod to 666 (not sure why it doesn't work without it)
- Run ```npm install``` in the project folder for dependencies before you can start using the api. There may be some extra requirements for your server to run bcrypt. Consult the bcrypt documentation to know more.
- Setup the mysql server and import the sql-file into a new database. The sql-file can be found in the installation folder.
- Copy ```config.js``` from the installation folder into ```/app/``` and fill all fields.
- Run the server with ```npm start``` in root folder
- Run ```node /installation/install_admin.js``` when you have verified a database connection.
- When you have verified that the API works you should set it up as a service. There is an example systemd configuration file in the ```installation/``` folder.

## Database Export

The database is exported as .sql and should be imported into a mysql database.

## /help

When your API is up and running, you will always be able to find help to your queries by using the api route /<route>/help.