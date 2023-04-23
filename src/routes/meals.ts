/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

import { checkSessionIdExists } from '../middleware/check-if-sessionId-exists'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        in_diet: z.boolean().optional().default(false),
      })

      // eslint-disable-next-line camelcase
      const { name, description, in_diet } = createMealsBodySchema.parse(
        request.body,
      )

      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id: cookieUserId }: { user_id: string } =
        JSON.parse(sessionCookie)

      console.log(JSON.parse(sessionCookie))

      try {
        const user = await knex('users').where({ id: cookieUserId }).first()

        if (!user) {
          return reply.status(404).send({ message: 'User not found' })
        }

        await knex('meals').insert({
          id: randomUUID(),
          user_id: cookieUserId,
          description,
          name,
          // eslint-disable-next-line camelcase
          in_diet: in_diet || false,
        })
      } catch (error) {
        return reply.status(500).send({ message: error })
      }
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id } = JSON.parse(sessionCookie)

      try {
        const meals = await knex('meals').where({ user_id })

        return meals
      } catch (error) {
        return reply.status(404).send({ message: 'No able to fetch meals' })
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionCookie = request.cookies.dietApiSessionId!

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id: mealId } = getMealParamsSchema.parse(request.params)

      const { user_id } = JSON.parse(sessionCookie)

      try {
        const meals = await knex('meals').where({ id: mealId, user_id }).first()

        return meals
      } catch (error) {
        return reply.status(404).send({ message: 'No able to fetch meal' })
      }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const putMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const putMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        in_diet: z.boolean().optional(),
      })

      const { id: mealId } = putMealParamsSchema.parse(request.params)

      const { name, description, in_diet } = putMealBodySchema.parse(
        request.body,
      )

      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id } = JSON.parse(sessionCookie)

      try {
        const meals = await knex('meals')
          .where({ id: mealId, user_id })
          .first()
          .update({
            name,
            description,
            in_diet,
            updated_at: new Date().toISOString(),
          })

        return meals
      } catch (error) {
        return reply
          .status(401)
          .send({ message: 'No able to update meal info' })
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const putMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id: mealId } = putMealParamsSchema.parse(request.params)

      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id } = JSON.parse(sessionCookie)

      try {
        await knex('meals').where({ id: mealId, user_id }).first().delete()

        return reply.status(204).send({ message: 'Meals deleted' })
      } catch (error) {
        return reply.status(404).send({ message: 'No able to delete meal' })
      }
    },
  )
}
