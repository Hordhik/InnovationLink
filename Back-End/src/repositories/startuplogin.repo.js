import { knex } from '../db/knex.js'

export async function findByEmail(email) {
    return knex('startuplogin').select('*').where({ email }).first()
}

export async function findByUsername(username) {
    return knex('startuplogin').select('*').where({ username }).first()
}

