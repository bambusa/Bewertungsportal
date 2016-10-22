/**
 * local config
 */
var configs = {
    serverConfig: {
        secret: "yVk!1rskSW9J!pq4rMq6",
        baseDir: "C:/Users/BSD/IdeaProjects/Bewertungsportal",
        port: 4000,
        hostAddress: "https://localhost:4000/",
        authCookieExpiration: 1
    },
    dbConfig: {
        host: 'localhost',
        user: 'benjamin',
        password: '0000',
        database: 'bewertungsportal'
    },
    dataConfig: {
        userRoleNames: {
            publicUser: "Privater Nutzer",
            privateUser: "Öffentlicher Nutzer",
            admin: "Admin",
            auditor: "Auditor",
            expert: "Experte"
        }
    },
    debugConfig: {
        consoleLevel: 'debug',
        logSql: true
    }
    //smtpConfig: {
    //    host: 'mail.agenturserver.de',
    //    port: 465,
    //    secure: true, // use SSL
    //    auth: {
    //        user: 'cloudservice@ball-b.de',
    //        pass: 'agaxEsip!757'
    //    }
    //}
};
module.exports.configs = configs;

/**
 * response
 */
var response = {
    status: {
        success: 0,
        loggedIn: 1,
        authenticated: 2,
        loginError: 3,
        authError: 4,
        tokenError: 5,
        internalError: 6,
        permissionError: 7,
        cookieError: 8,
        requestError: 9,
        deviceRegistered: 10,
        clientRegistered: 11,
        userRegistered: 12,
        eboxRegistered: 13
    },
    errMessage: {
        not_auth_red_login: "Sorry, you need to login first.",
        no_perm_red_index: "Sorry, you don't have the required permissions to do that.",
        token_note_verified: "Sorry, your authentication token could not be verified or is expired, please authenticate yourself first.",
        radio_credentials_id_exists: "radio_credentials_id already exists"
    }
};
module.exports.response = response;

/**
 * Strings
 */
var strings = {
    german: {
        defaultCampaign: "Standard"
    }
};
module.exports.strings = strings;