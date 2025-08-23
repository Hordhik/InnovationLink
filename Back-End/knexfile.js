import dotenv from 'dotenv'
dotenv.config()

export default {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'innovationlink',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    },
    migrations: {
        directory: './src/db/migrations'
    },
    seeds: {
        directory: './src/db/seeds'
    }
}
