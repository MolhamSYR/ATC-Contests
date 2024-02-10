const axios = require('axios');
const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

const bot = {

sendMessage(chatid, msgText, threadid) {

        axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatid,
        message_thread_id: threadid,
        text: msgText,
        parse_mode: "HTML"
    });

}

}

module.exports = {bot};