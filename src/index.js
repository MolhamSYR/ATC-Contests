const TelegramBot = require("node-telegram-bot-api");
const fs = require('fs');
const path = require('path');
const { isNumber } = require("util");
const axios = require('axios');


var filePath = path.join(process.cwd(), 'src');
filePath = path.join(filePath, 'data.json');

const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const SERVER_URL = process.env.SERVER_URL;
const TEL_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URI = SERVER_URL+URI

const express = require('express');
const app = express();

const init = async () => {
    const res = await axios.getAdapter(`${TEL_API}/setWebhook?url=${WEBHOOK_URI}`);
    console.log(res.data);
};

app.listen(process.env.PORT || 3000, async () => {
    console.log("App Running on Port" + process.env.PORT || 3000);
    await init();
});


let localData = { "chatID": -1 };
let MAIN_CHANNEL = -1;
let MAIN_THREAD = -1;
let MAX_DAYS = 7;



var platforms = ["usaco", "codechef", "codeforces"];

var usaco = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=25&upcoming=true&format=json";
var codechef = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=2&upcoming=true&format=json";

function updateContestsDaily(prevDay, chatid, threadid) {

    if(chatid === -1) {
        console.log("Invalid CHAT ID: " + chatid);
        return;
    }

    var now = new Date();
    var dateFormat = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Damascus",
        day: "numeric"
    });
    
    var day = dateFormat.format(now);

    if(day != prevDay) {
        bot.sendMessage(chatid, "<b>Daily Report: </b>\n", {
            message_thread_id: threadid,
            parse_mode: "HTML"
        })
        getCodeforces(chatid, threadid, 0);
        getContests(chatid, "Codechef", codechef, threadid, 0);
        getContests(chatid, "USACO", usaco, threadid, 0);
    }

    setTimeout(() => {
        updateContests(day, chatid, threadid);
    }, 1000 * 60 * 60);

}

function diff_hours(dt2, dt1) 
 {

    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
  
 }

async function getCodeforces(chatid, threadid, maxtime) {

    const response = await fetch("https://codeforces.com/api/contest.list?gym=false");
    const data = await response.json();

    let message = "<b> <i> Codeforces Upcoming Contests: </i> </b>\n\n";

    let preMsg = [];
    let cnt = 0;

    for(var contest of data.result) {

        let msg = "";
        if(contest.phase != "BEFORE") continue;

        msg += "<b>Name:</b> " + contest.name + '\n';

        /* START OF TIME CONVERTING */
        var dt = new Date(contest.startTimeSeconds * 1000);
        var now = new Date();
        var dateFormat = new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Damascus",
                hour: "numeric",
                minute: "numeric",
                year: "numeric",
                day: "numeric",
                month: "numeric"
            });

        var lastdate = dateFormat.format(dt);

        var start = dt - now;

        var daydiff = Math.floor(start / (1000 * 60 * 60 * 24)); 

        if(daydiff > maxtime) continue;
        /* END OF TIME CONVERTING */

        msg += "<b>Date:</b> " + lastdate + '\n';
        msg += "<b>Time Left:</b> " +  daydiff + " days left\n";
        
        preMsg[cnt] = msg;
        cnt = cnt + 1;
    }

    preMsg.reverse();

    for(let tmp of preMsg) {
        message += tmp + '\n';
    }

    bot.sendMessage(chatid, message, {
        "parse_mode": "HTML",
        "message_thread_id": threadid
    });


}

async function getContests(chatid, name, api, threadid, maxtime) {

    const response = await fetch(api);
    const data = await response.json();

    let message = "<b> <i>" + name + " Upcoming Contests: </i> </b>\n\n";

    for(var contest of data.objects) {

        let msg = "";

        msg += "<b>Name:</b> " + contest.event + '\n';

        var dt = new Date(contest.start);
        var now = new Date();
        var dateFormat = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Damascus",
            hour: "numeric",
            minute: "numeric",
            year: "numeric",
            day: "numeric",
            month: "numeric"
            
        });
        var lastdate = dateFormat.format(dt);
        var start = dt - now;
        var daydiff = Math.floor(start / (1000 * 60 * 60 * 24));  

        if(daydiff > maxtime) continue;

        msg += "<b>Date:</b> " + lastdate + '\n';
        msg += "<b>Time Left:</b> " +  daydiff + " days left\n";


        message += msg + '\n';
    }

    bot.sendMessage(chatid, message, {
        "parse_mode": "HTML",
        "message_thread_id": threadid
    });

}

fs.readFile(filePath, (err, content) => {

    if(err) {
        console.log(err);
        return;
    }
    console.log("PARSED THAT JSON");
    localData = JSON.parse(content);
    console.log("SET MAIN CHANNEL TO: " + localData.chatID);
    MAIN_CHANNEL = localData.chatID;
    MAIN_THREAD = localData.threadID;
    MAX_DAYS = localData.maxDays;
});

var now = new Date();
    var dateFormat = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Damascus",
        day: "numeric"
    });
    
var day = dateFormat.format(now);

setTimeout(() => {
    updateContestsDaily(day-1, MAIN_CHANNEL, MAIN_THREAD);
}, 5000);

bot.on("message", msg => {

    const topic = msg.is_topic_message ? msg.message_thread_id : undefined;

    let txt = msg.text;

    if(txt == "/shutdown") {
        bot.close();
    }
    
    else if(txt == "/help") {
        bot.sendMessage(msg.chat.id, "Welcome to Aleppo Teenagers Competitors Bot!\n<b>Usage: </b> /contests YOUR_PLATFORM", {
            parse_mode: "HTML",
            message_thread_id: topic
         });
    }

    else if(txt == "/sendchannel") {
        bot.sendMessage(msg.chat.id, "Main Channel ID: " + MAIN_CHANNEL, {
            message_thread_id: topic
        });
        bot.sendMessage(msg.chat.id, "A message has been sent to the main channel successfully!", {
            message_thread_id: topic
        });
        bot.sendMessage(MAIN_CHANNEL, "This message has been sent to the main channel via a command!", {
            message_thread_id: MAIN_THREAD
        });
    }

    else if(txt == "/setchannel") {

        if(!msg.chat.is_forum) {
            bot.sendMessage(msg.chat.id, "This group isn't a super-group!", {
                "message_thread_id": topic
            })
            
        }

        else {

        localData.chatID = msg.chat.id;
        localData.threadID = topic;
        MAIN_THREAD = topic;
        MAIN_CHANNEL = msg.chat.id;
        var newJsonData = JSON.stringify(localData);
        console.log(filePath);
        fs.writeFile(filePath, newJsonData, (err) => {
                if(err) {
                    bot.sendMessage(msg.chat.id, "Error Occurred!", {
                        "message_thread_id": topic
                    });
                }

                else {
                  
                    bot.sendMessage(msg.chat.id, "<b>The main channel has been set to this channel successfully!</b>", {
                        "parse_mode": "HTML",
                        "message_thread_id": topic
                    })
                }
        });
    }

    }

    else if(txt.substring(0, txt.indexOf(" ")) == "/setmaxdays") {
        const para = txt.substring(txt.indexOf(" ") + 1);
        try {
            const num = parseInt(para);
            if(num < 0) {
                bot.sendMessage(msg.chat.id, "Number can't be negative!", {
                    "message_thread_id": topic
                })
            }

            else {
                localData.maxDays = num;
                const newData = JSON.stringify(localData);
                MAX_DAYS = num;
                fs.writeFile(filePath, newData, (err) => {

                    if(err) {
                        bot.sendMessage(msg.chat.id, "An error occurred!", {
                            message_thread_id: topic
                        });
                        console.log(err);
                    }

                    else {
                        bot.sendMessage(msg.chat.id, "<b>Max Days has been set to " + num + " successfully! </b>", {
                            message_thread_id: topic,
                            parse_mode: "HTML"
                        })

                    }

                })

            }

        } catch(err) {
            bot.sendMessage(msg.chat.id, "" + para + " isn't a number!", {
                "message_thread_id": topic
            });
        }


    }

    else if(txt.substring(0, txt.indexOf(" ")) == "/contests") {

        const platform = txt.substring(txt.indexOf(" ") + 1);
        
        if(platform == "codeforces") {
            getCodeforces(msg.chat.id, topic, MAX_DAYS);
        }

        else if(platform == "codechef") {
            getContests(msg.chat.id, "Codechef", codechef, topic, MAX_DAYS);
        }

        else if(platform == "usaco") {
            getContests(msg.chat.id, "USACO", usaco, topic, MAX_DAYS);
        }

        else {
            bot.sendMessage(msg.chat.id, "Platform " + platform + " isn't in my database!", {
                "message_thread_id": topic
            });
        }

        
    }

});