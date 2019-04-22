const inactiveThresold = 5 // 不活跃用户条数

export default (chats, config) => {
  const tagsSet = new Set()
  config.tags.forEach((tag) => tagsSet.add(tag))
  // 用户聊天与发言数量Map
  const userChatCountMap = new Map()
  let userChatCount = 0
  // 未经过滤的完整用户与发言数量Map
  const userChatCountUnfilteredMap = new Map()
  // let userChatCountUnfiltered = 0
  // 用户昵称Map
  const userNickName = new Map()

  /* const chatAfterFilter = */
  chats.filter((chat) => {
    if (userChatCountUnfilteredMap.has(chat.account)) {
      userChatCountUnfilteredMap.set(chat.account, userChatCountUnfilteredMap.get(chat.account) + 1)
    } else {
      userChatCountUnfilteredMap.set(chat.account, 1)
    }
    // userChatCountUnfiltered++

    if (config.filterTeacher) {
      if (/^助教|教师/.test(chat.nickname)) {
        if (userChatCountMap.has(chat.account)) {
          userChatCountMap.delete(chat.account)
        }
        return false
      }
    }

    if (userNickName.has(chat.account)) {
      if (userNickName.get(chat.account) !== chat.nickname) {
        userNickName.set(chat.account, chat.nickname)
      }
    } else {
      userNickName.set(chat.account, chat.nickname)
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
    userChatCount++

    return true
  })

  // 过滤平时不活跃用户
  for (let user of userChatCountUnfilteredMap) {
    if (user[1] > inactiveThresold) {
      userChatCountMap.delete(user[0])
    }
  }

  const users = []
  for (let user of userChatCountMap) {
    users.push({
      account: user[0],
      count: user[1],
      nickname: userNickName.get(user[0]),
      random: Math.random() * user[1] / userChatCount * 100
    })
  }
  users.sort((a, b) => b.random - a.random)

  // 抽奖奖品，物以稀为贵，数量最小的给运气最好的用户
  const prizes = [...config.prizes]
  prizes.sort((a, b) => a.count - b.count)

  const ret = []
  let userPosition = 0
  prizes.forEach((prize) => {
    let count = prize.count
    while (count-- && userPosition < users.length) {
      ret.push({
        user: users[userPosition],
        prize: prize.name
      })
      userPosition++
    }
  })

  console.log(ret)
  return ret
}
