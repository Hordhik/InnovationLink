import knexLib from 'knex'
import config from '../../knexfile.js'

const envConfig = config
export const knex = knexLib(envConfig)
