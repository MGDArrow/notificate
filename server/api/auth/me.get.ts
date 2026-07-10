
export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event)
  if (!userId) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }
  const user = await findUserById(userId)
  if (!user) {
    throw createError({ status: 404, message: 'Пользователь не найден' })
  }
  return { id: user.id, email: user.email }
})