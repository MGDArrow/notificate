// server/api/subscriptions.get.ts
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const groups = await getUserSubscriptions(userId) 
  return groups.map(g => ({
    id: g.id, 
    groupId: g.id,
    groupName: g.name,
    createdAt: g.createdAt
  }))
})