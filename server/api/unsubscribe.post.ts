import { removeSubscription } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { group, endpoint } = await readBody(event)
  removeSubscription(group, endpoint)
  return { success: true }
})