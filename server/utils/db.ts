import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'data')
const KEYS_FILE = path.join(DATA_DIR, 'keys.json')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

// инициализация
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function readJSON<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return {} as T
  }
}
function writeJSON(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ключи -> группы
export function getGroupByKey(key: string): string | null {
  const map = readJSON<Record<string, string>>(KEYS_FILE)
  return map[key] || null
}

// подписки: { groupName: [PushSubscription, ...] }
export function getSubscriptions(group: string): PushSubscription[] {
  const all = readJSON<Record<string, PushSubscription[]>>(SUBSCRIPTIONS_FILE)
  return all[group] || []
}
export function addSubscription(group: string, sub: PushSubscription) {
  const all = readJSON<Record<string, PushSubscription[]>>(SUBSCRIPTIONS_FILE)
  if (!all[group]) all[group] = []
  // избегаем дублей (по endpoint)
  if (!all[group].some(s => s.endpoint === sub.endpoint)) {
    all[group].push(sub)
    writeJSON(SUBSCRIPTIONS_FILE, all)
  }
}
export function removeSubscription(group: string, endpoint: string) {
  const all = readJSON<Record<string, PushSubscription[]>>(SUBSCRIPTIONS_FILE)
  if (all[group]) {
    all[group] = all[group].filter(s => s.endpoint !== endpoint)
    writeJSON(SUBSCRIPTIONS_FILE, all)
  }
}

// сообщения: { groupName: [{ id, text, timestamp }] }
export function getMessages(group: string) {
  const all = readJSON<Record<string, any[]>>(MESSAGES_FILE)
  return all[group] || []
}
export function addMessage(group: string, text: string) {
  const all = readJSON<Record<string, any[]>>(MESSAGES_FILE)
  if (!all[group]) all[group] = []
  all[group].push({ id: Date.now(), text, timestamp: new Date().toISOString() })
  writeJSON(MESSAGES_FILE, all)
}