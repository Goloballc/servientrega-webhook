require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    authToken: process.env.SERVIENTREGA_AUTH_TOKEN,
    authTokenSecondary: process.env.SERVIENTREGA_AUTH_TOKEN_SECONDARY || null,
    db: {
        host:     process.env.DB_HOST     || '127.0.0.1',
        port:     process.env.DB_PORT     || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'servientrega_tracking',
    },
};
