
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const subs = await getUserSubscriptions(userId)
  return subs.map(s => ({
    id: s.id,
    groupName: s.group.name,
    groupId: s.groupId,
    endpoint: s.endpoint,
    createdAt: s.createdAt
  }))
})