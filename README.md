# PredictSoft v2.10
(C)2016-2017 Gaurav R Joshi

This is the online prediction application originally built for the Nepalese Northwest Arkansas folks. The code has been forked off of the NWA Online Fantasy App (NoFApp v1.00) which was piloted for the Twenty 20 Cricket Tournament 2016.

# Pre-requisites

This application needs the following to be installed before it can be deployed:
* MySQL server
* node
* npm

# Installation

## Clone the github directory on server

```bash
  # mkdir psoft2_IPL
  # cd psoft2_IPL
  # git clone https://github.com/grv2k8/psoft2_IPL.git
  # cd psoft2_IPL
```
## Run npm install on main folder and inside /app folder
```bash
  npm install
  cd app
  npm install
```

## Import the database and tables from SQL file in the source database directory (TODO) into MySQL

## Run the server

```bash
  nodejs psoft2_IPL.js
```

## Rename and update the three config files in the /config directory:
* psoft_config.js - Application configuration
* dbconfig.js     - Handles PSoft database configuration
* smtpconfig.js   - Handles email configuration

## You're all set when you see a message similar to the following

```bash
  [Apr 06 2017 00:16:09] Loaded Sequelize modules...
  [Apr 06 2017 00:16:09] PredictSoft v2.10 started on port 8080
```
