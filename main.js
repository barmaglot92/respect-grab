var rp = require('request-promise')
const fs = require('fs')

const getPrice = async () => {
  try {
    const pageHTMLTEXT = await rp('https://respect-shoes.ru/is32_110253')
    const priceFound = pageHTMLTEXT.match(/<p class="price"><b>(.*?)<\/b>/gim)
    const price = priceFound[0].match(/b>(.+)<\/b/i)
    const resultPrice = Number(price[1].replace(/\s+/, ''))
    const oldPrice = fs.readFileSync('./cachedPrice', { encoding: 'utf8' })

    console.log('oldPrice', oldPrice)
    console.log('newPrice', resultPrice)

    if (!oldPrice) {
      fs.writeFileSync('./cachedPrice', resultPrice)
    }

    console.log('compare', resultPrice, '<', oldPrice)

    if (Number(resultPrice) < oldPrice) {
      // cheeper price found
      fs.writeFileSync('./cachedPrice', resultPrice)
      return resultPrice
    } else {
      return null
    }
  } catch (err) {
    throw err
  }
}

const check = async () => {
  try {
    const price = await getPrice()
    if (price !== null) {
      telegram.sendMessage('@feedabc', `New lower price is ${price}`)
    }
  } catch (err) {
    console.log(err)
  }
}

check()

const Telegram = require('telegraf/telegram')
const telegram = new Telegram(process.env.BOT_TOKEN)

const schedule = require('node-schedule')

const j = schedule.scheduleJob('*/10 * * * *', () => {
  check()
})
