import userInBlacklist from './userInBlacklist'

export default (content) => {
  const records = content.split('\n').map(a => a.trim())
  const ret = []

  const pushUser = (chat) => {
    if (chat !== null) {
      if (!userInBlacklist(chat)) {
        chat.content = chat.content.trim()
        makeTags(chat)
        ret.push(chat)
      }
    }
  }

  let current = null

  const makeTags = (record) => {
    const tags = []
    const regex = /#(.*?)#、?/g
    record.content = record.content.replace(regex, (r, r1) => {
      tags.push(r1)
      return ''
    })
    record.tags = tags
  }

  records.forEach(record => {
    const regex = /^(\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}) (.*?)[(<]([a-zA-Z0-9@.-]*?)[)>]$/
    if (regex.test(record)) {
      const match = record.match(regex)
      pushUser(current)
      current = {
        time: new Date(match[1]),
        nickname: match[2],
        account: match[3],
        tags: [],
        content: ''
      }
    } else {
      if (current === null) {
        return null
      }
      current.content += record + '\n'
    }
  })
  pushUser(current)
  return ret
}
