/**
 * local config
 */
var configs = {
    serverConfig: {
        secret: "yVk!1rskSW9J!pq4rMq6",
        baseDir: "C:/Users/BSD/IdeaProjects/Bewertungsportal",
        port: 4000,
        hostAddress: "http://localhost:4000/",
        authCookieExpiration: 12,
        verificationTimer: 60000
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
    },
    smtpConfig: {
        host: 'mail.gmx.net',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'schwarz_dev@gmx.de',
            pass: '%jtTckIgD7jw'
        }
    }
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
        requestError: 9
    },
    errMessage: {
        not_auth_red_login: "Sorry, you need to login first.",
        no_perm_red_index: "Sorry, you don't have the required permissions to do that.",
        token_note_verified: "Sorry, your authentication token could not be verified or is expired, please authenticate yourself first.",}
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