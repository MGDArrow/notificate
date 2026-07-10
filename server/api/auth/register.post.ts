import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов')
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  const existing = await findUserByEmail(email)
  if (existing) {
    throw createError({ status: 400, message: 'Пользователь с таким email уже существует' })
  }

  const passwordHash = hashPassword(password)
  const user = await createUser(email, passwordHash)

  const token = signJwt(user.id)
  setAuthCookie(event, token)

  return { id: user.id, email: user.email }
})