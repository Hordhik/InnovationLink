export async function up(knex) {
    await knex.schema.createTable('startuplogin', (table) => {
        table.increments('sno').primary()
        table.string('username').notNullable().unique()
        table.string('email').notNullable().unique()
        table.string('password').notNullable()
        table.timestamps(true, true)
    })
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('startuplogin')
}
