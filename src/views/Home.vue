<template>
  <div>
    <el-dialog
      title="抽奖结果"
      :visible.sync="dialogVisible"
      :before-close="handleDialogClose">
      <div>
        <el-table
          :data="lotteryResult"
          stripe
          style="width: 100%">
          <el-table-column
            prop="user.nickname"
            label="昵称"
            width="180">
          </el-table-column>
          <el-table-column
            prop="user.account"
            label="帐号"
            width="180">
          </el-table-column>
          <el-table-column
            prop="prize"
            label="奖品">
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="关键词">
        <el-tag
          :key="tag"
          v-for="tag in form.tags"
          closable
          @close="handleRemoveTag(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-model="newKeyword"
          ref="saveTagInput"
          size='small'
          style='width: 10em'
          @keyup.enter.native="handleNewKeyword"
          @blur="handleNewKeyword"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="发言时段">
        <el-date-picker
          v-model="form.period"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="奖品列表">
        <div v-for="prize in form.prizes" :key="prize.name">
          <div><span>{{prize.name}} - {{prize.count}}人</span><span style='margin-left: 1em'><el-button size='small' @click="removePrize(prize.name)">删除</el-button></span></div>
        </div>
        <div class='prize-add-row'>
          <el-input size='small' style='width: 10em' placeholder='奖品名' v-model="newPrizeName"></el-input>
          <el-input-number size='small' v-model="newPrizeCount" :min="1" :max="100" label="奖品数量"></el-input-number>
        <el-button size='small' @click='handleAddPrize'>增加</el-button>
        </div>
      </el-form-item>
      <el-form-item label="聊天记录">
        <el-upload
          class="upload-demo"
          ref="upload"
          action=''
          :file-list="form.fileList"
          :show-file-list="false"
          :multiple="false"
          :on-change="handleFileUpload"
          :auto-upload="false">
            <el-button slot="trigger" size="small">选择聊天记录</el-button>
            <span v-if="parseChatMessage !== ''">
              {{parseChatMessage}}
            </span>
        </el-upload>
      </el-form-item>
      <el-form-item label="其他">
        <el-checkbox v-model="form.filterTeacher" label="过滤助教和教师"></el-checkbox>
        <el-checkbox v-model="form.filterInactive" label="过滤发言小于5条的用户"></el-checkbox>

      </el-form-item>
      <el-form-item label="抽奖文案">
        <el-input type="textarea" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="doLotty">抽奖</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import parseRecord from '../utils/parseRecord'
import doLotty from '../utils/doLotty'
import { Message } from 'element-ui'

export default {
  data () {
    return {
      dialogVisible: false,
      lotteryResult: [],
      newPrizeName: '',
      newPrizeCount: 10,
      newKeyword: '',
      parseChatMessage: '',
      fileList: [],
      chats: [],
      form: {
        tags: ['我要参与换组活动', '我要红包', '我爱软工实践', '我要当学习委员'],
        prizes: [
          { name: '奖品', count: 1 }
        ],
        period: [new Date(2022, 1, 10, 10, 10), new Date(2022, 12, 31, 10, 10)],
        description: '',
        filterTeacher: true,
        filterInactive: false
      }
    }
  },
  created () {
    /*
    const text = require('raw-loader!../../.data/QQrecord-2022.txt') // eslint-disable-line
    this.chats = parseRecord(text.default)
    */
  },
  methods: {
    doLotty () {
      if (this.form.prizes.length === 0) {
        return Message.error('还没有设置奖品')
      }
      if (this.chats.length === 0) {
        return Message.error('还没有导入聊天记录')
      }
      this.lotteryResult = doLotty(this.chats, this.form)
      this.dialogVisible = true
    },
    handleRemoveTag (tag) {
      this.form.tags.splice(this.form.tags.indexOf(tag), 1)
    },
    removePrize (name) {
      this.form.prizes = this.form.prizes.filter(prize => prize.name !== name)
    },
    handleAddPrize () {
      if (this.newPrizeName.trim() === '') return
      if (this.form.prizes.filter(prize => prize.name === this.newPrizeName).length > 0) {
        return Message.error('已有当前奖品')
      }
      this.form.prizes.push({
        name: this.newPrizeName,
        count: this.newPrizeCount
      })
      this.newPrizeName = ''
    },
    handleNewKeyword () {
      let inputValue = this.newKeyword
      if (inputValue) {
        this.form.tags.push(inputValue)
      }
      this.newKeyword = ''
    },
    handleFileUpload (file, fileList) {
      if (file.status !== 'ready') return
      const reader = new FileReader()
      reader.onload = (file) => {
        const content = file.target.result
        const ret = parseRecord(content)
        if (ret.length === 0) {
          this.parseChatMessage = '解析失败，请确认是否是QQ聊天记录。'
          this.chats = []
        } else {
          const accountSet = new Set()
          ret.forEach((chat) => accountSet.add(chat.account))
          this.parseChatMessage = `解析成功，共解析${ret.length}条记录，找到${accountSet.size}个用户。`
          this.chats = ret
        }
      }
      reader.readAsText(file.raw)
    },
    handleDialogClose () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang='scss'>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
    line-height: 38px;
  }
  div + .prize-add-row {
    padding-top: 1em;
  }
  .prize-add-row {
    > * {
      margin-right: 1em;
    }
  }
</style>
