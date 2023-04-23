import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').notNullable().primary()
    table.string('name').notNullable()
    table.string('description').nullable()
    table.boolean('in_diet').notNullable().defaultTo(false)
    table.string('user_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
