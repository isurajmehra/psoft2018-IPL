/**
 * (C)grjoshi 4/20/2016
 * smtpconfig.js - Nodemailer configuration object
 * First-run instructions: Rename this file to smtpconfig.js in the config/ folder
 //==============================================================================
 */


//now supports gmail addresses

module.exports = {
    enabled: true,
    service: 'gmail',
    auth: {
        user: '[gmail address]@gmail.com',
        pass: '[gmail_password]'
    }
};
//delete the above block and uncomment the following to use server's SMTP settings
/*
module.exports = {
    enabled: true,
    host: 'smtp_server_here',
    port: 465,
    user: 'user@email.com',
    password: '********'
};
*/