import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.foreign('user_id', 'FK_user_meal').references('user.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.dropForeign('user_id', 'FK_user_meal')
  })
}
