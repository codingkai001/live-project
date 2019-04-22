const defaultBlacklist = ['10000', '1000008', '80000008']
const blackListSet = new Set()

// 过滤系统消息等不参与抽奖的用户
makeBlackList(defaultBlacklist)

export function makeBlackList (blacklist) {
  blacklist.forEach(item => blackListSet.add(item))
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
