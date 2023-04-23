// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      name: string
      email: string
      avatar_url: string | null
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      user_id: string
      in_diet: boolean
      created_at: string
      updated_at: string
    }
  }
}
