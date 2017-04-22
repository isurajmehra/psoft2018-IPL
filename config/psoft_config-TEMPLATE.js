/**
 * (C)grjoshi 4/20/2017
 * psoft2config.js - handles application config options
 * First-run instructions: Rename this file to psoft2config.js in the /config folder
 //==================================================================================
 */

module.exports = {
	app_port: 8990,
	app_name: 'Predictsoft',
	app_version: 'v2.10',
    //admin config ahead
    r00t_port: 8999,
    match_lock_threshold_in_minutes: 15				//defines the number of minutes before the match time to lock
};
