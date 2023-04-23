/* eslint-disable camelcase */
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-if-sessionId-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      avatar_url: z.string().optional(),
    })

    const {
      name,
      email,
      avatar_url: avatarUrl,
    } = createUserBodySchema.parse(request.body)

    const userId = randomUUID()

    const sessionId = randomUUID()

    reply.cookie(
      'dietApiSessionId',
      JSON.stringify({ session_id: sessionId, user_id: userId }),
      {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    )

    try {
      await knex('users').insert({
        id: userId,
        name,
        email,
        avatar_url: avatarUrl || null,
        session_id: sessionId,
      })

      return reply.status(201).send()
    } catch (error) {
      console.log(error)
      return reply.status(400).send({ message: error })
    }
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id } = JSON.parse(sessionCookie)

      console.log(user_id)

      try {
        const user = await knex('user').where({ user_id }).first()

        return user
      } catch (error) {
        return reply.status(400).send({ message: 'User not found' })
      }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionCookie = request.cookies.dietApiSessionId!

      const { user_id } = JSON.parse(sessionCookie)

      try {
        const userRegisteredMeals = await knex('meals').where({ user_id })

        const userMealsInDiet = await knex('meals').where({
          user_id,
          in_diet: true,
        })
        const userMealsOffDiet = await knex('meals').where({
          user_id,
          in_diet: false,
        })
        // const userMealsGroupBy = knex.raw()
        const userMealsOrderByDate = await knex('meals')
          .where({ user_id })
          .orderBy('created_at', 'asc')

        console.log(userMealsOrderByDate)

        let bestSequence = 0
        let actualSequence = 0
        for (const meal of userMealsOrderByDate) {
          if (meal.in_diet) {
            actualSequence += 1
          } else {
            actualSequence = 0
          }

          if (actualSequence > bestSequence) bestSequence = actualSequence
        }

        return {
          user_registered_meals: userRegisteredMeals.length,
          user_meals_in_diet: userMealsInDiet.length,
          user_meals_off_diet: userMealsOffDiet.length,
          user_best_sequences: bestSequence,
        }
      } catch (error) {
        console.log(error)
        return reply.status(401).send({ message: error })
      }
    },
  )
}
