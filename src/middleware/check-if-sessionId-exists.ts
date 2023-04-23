/* eslint-disable camelcase */
import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const dietApiSessionId = request.cookies.dietApiSessionId

  if (!dietApiSessionId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const { user_id } = JSON.parse(dietApiSessionId)

  const user = await knex('users').where({ id: user_id })

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
