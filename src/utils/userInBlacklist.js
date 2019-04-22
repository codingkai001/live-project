const defaultBlacklist = ['10000']
const blackListSet = new Set()

// 过滤系统消息等不参与抽奖的用户
makeBlackList(defaultBlacklist)

export function makeBlackList (blacklist) {
  blacklist.forEach(item => blackListSet.add(blacklist))
}

export function clearBlacklist () {
  blackListSet.clear()
}

export default (chat) => {
  if (blackListSet.has(chat.account)) {
    return true
  }
  return false
}
