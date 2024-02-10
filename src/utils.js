const axios = require('axios');
const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

async function sendMessage(chatid, msgText, threadid) {

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatid,
        message_thread_id: threadid,
        text: msgText,
        parse_mode: "HTML"
    });

}

module.exports = {sendMessage};