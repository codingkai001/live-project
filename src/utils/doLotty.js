export default (chats, config) => {
  const tagsSet = new Set()
  config.tags.forEach((tag) => tagsSet.add(tag))
  // 用户聊天与发言数量Map
  const userChatCountMap = new Map()
  // 未经过滤的完整用户与发言数量Map
  const userChatCountWithoutFilterMap = new Map()
  const chatAfterFilter = chats.filter((chat) => {
    if (userChatCountWithoutFilterMap.has(chat.account)) {
      userChatCountWithoutFilterMap.set(chat.account, userChatCountWithoutFilterMap.get(chat.account) + 1)
    } else {
      userChatCountWithoutFilterMap.set(chat.account, 1)
    }

    if (config.filterTeacher) {
      if (/^助教|教师/.test(chat.nickname)) {
        return false
      }
    }

    // 空消息
    // if (chat.content.trim() === '') {
    // return false
    // }

    // 是否含标签
    if (config.tags.length > 0) {
      const tags = chat.tags.filter(tag => tagsSet.has(tag))
      if (tags.length === 0) {
        return false
      }
    }
    // 是否在指定日期
    if (config.period !== null) {
      if (chat.time < config.period[0] || chat.time > config.period[1]) {
        return false
      }
    }

    if (userChatCountMap.has(chat.account)) {
      userChatCountMap.set(chat.account, userChatCountMap.get(chat.account) + 1)
    } else {
      userChatCountMap.set(chat.account, 1)
    }

    return true
  })
  console.log(userChatCountWithoutFilterMap)
  return chatAfterFilter
}
