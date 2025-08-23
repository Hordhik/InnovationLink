import { knex } from '../db/knex.js'

export async function findInvestorByEmail(email) {
    return knex('investorlogin').select('*').where({ email }).first()
}

export async function findInvestorByUsername(username) {
    return knex('investorlogin').select('*').where({ username }).first()
}
