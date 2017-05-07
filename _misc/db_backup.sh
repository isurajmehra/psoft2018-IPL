#!/bin/bash
# Backup the psoft2017 DB each day after last match has been locked
# Prerequisites: make sure gdrive is installed to allow google drive uploads (https://github.com/prasmussen/gdrive)
# Add the following line to crontab to run this script automatically (following example runs at 9:30 AM each day server time)
# 30 9 * * * /home/psoft2017/predictsoft_IPL2017/db_backup.sh

SQLFILE=psoft2017_PRODUCTION_BACKUP_$(date +"%m-%d-%Y_%H%Mhrs.sql");
#echo $SQLFILE;
#create SQL dump of current DB
mysqldump -h localhost -upsoft2017 -p'J<3mBS0q' --opt psoft2017_PRODUCTION > /home/psoft2017/predictsoft_IPL2017/db_bkps/$SQLFILE

#upload it to google drive (make sure to init gdrive by doing "gdrive about" and registering any tokens it asks beforehand)
gdrive upload /home/psoft2017/predictsoft_IPL2017/db_bkps/$SQLFILE
