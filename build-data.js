const fs = require('fs')
const records = fs.readFileSync('./.data/QQrecord-2022.txt', 'utf-8').split('\n').map(a => a.trim())
const ret = []

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
  const regex = /^(\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}) (.*?)[(<](.*?)[)>]$/
  if (regex.test(record)) {
    const match = record.match(regex)
    if (current !== null) {
      current.content = current.content.trim()
      makeTags(current)
      ret.push(current)
    }
    current = {
      time: new Date(match[1]).getTime(),
      nickname: match[2],
      account: match[3],
      tags: [],
      content: ''
    }
  } else {
    current.content += record + '\n'
  }
})
ret.push(current)

console.log(ret)
