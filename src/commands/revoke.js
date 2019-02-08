const db = require('../databases/lokijs')
const inq = require('../megabot-internals/controllers/inquirer')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg) => {
    const query = {
      type: 3,
      userID: msg.author.id
    }
    const report = db.chain('questions').find(query).simplesort('expire', { desc: true }).data()[0]
    if (!report) return msg.channel.createMessage('No report found')
    else {
      const x = await msg.channel.createMessage({
        content: 'Are you sure you want to cancel this recent report?',
        ...generateEmbed(report)
      })
      inq.awaitReaction([ids.emojis.confirm, ids.emojis.dismiss], x, msg.author.id).then(z => {
        if (z.id === ids.emojis.confirm.id) {
          db.delete('holds', report.wb_id)
          bot.deleteMessage(ids.queue, report.wb_id)
          db.remove('questions', report)
          return x.edit({ content: 'Report revoked', embed: null })
        } else if (z.id === ids.emojis.dismiss.id) {
          x.edit({ content: 'Cancelled', embed: null })
        }
      })
    }
  }
}

const generateEmbed = (x) => {
  return {
    embed: {
      description: `Dupe request concerning ${x.ids.dupe} to be merged into ${x.ids.target}`,
      color: 0xbd6bd8
    }
  }
}
