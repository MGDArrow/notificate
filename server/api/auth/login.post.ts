import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  const user = await findUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ status: 401, message: 'Неверный email или пароль' })
  }

  const token = signJwt(user.id)
  setAuthCookie(event, token)

  return { id: user.id, email: user.email }
})