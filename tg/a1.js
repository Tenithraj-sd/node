const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Load product data from JSON
const productData = JSON.parse(fs.readFileSync('products.json', 'utf-8'));

// Store message IDs for deletion
const userMessages = new Map();

// Function to track user activity and set a deletion timer
const trackUserActivity = (chatId, messageId) => {
    if (!userMessages.has(chatId)) {
        userMessages.set(chatId, []);
    }
    userMessages.get(chatId).push(messageId);

    setTimeout(() => {
        if (userMessages.has(chatId)) {
            userMessages.get(chatId).forEach(msgId => {
                bot.deleteMessage(chatId, msgId).catch(() => {});
            });
            userMessages.delete(chatId);

            // Send the restart message
            bot.sendMessage(chatId, "To run the bot click /start");
        }
    }, 60000); // 60 seconds timer
};

// Function to send a message and delete the previous one
const sendMessage = (chatId, text, options) => {
    if (userMessages.has(chatId)) {
        userMessages.get(chatId).forEach(msgId => {
            bot.deleteMessage(chatId, msgId).catch(() => {});
        });
        userMessages.set(chatId, []);
    }
    
    bot.sendMessage(chatId, text, options).then(sentMessage => {
        trackUserActivity(chatId, sentMessage.message_id);
    });
};

// Function to generate main menu keyboard
const getMainMenu = () => {
    const keyboard = Object.keys(productData).map(category => [
        { text: `🍛 ${category}`, callback_data: `category_${category}` }
    ]);
    keyboard.push([{ text: '📞 Contact', callback_data: 'contact' }]);
    return { reply_markup: { inline_keyboard: keyboard } };
};

// Function to generate product list keyboard
const getProductMenu = (category) => {
    const keyboard = Object.keys(productData[category].products).map(product => [
        { text: product, callback_data: `product_${category}_${product}` }
    ]);
    keyboard.push([{ text: '🔙 Back', callback_data: 'start' }]);
    return { reply_markup: { inline_keyboard: keyboard } };
};

// Function to generate product details keyboard
const getProductDetailsMenu = (category, product) => {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '❓ What?', callback_data: `info_${category}_${product}_what` }],
                [{ text: '💡 Benefits', callback_data: `info_${category}_${product}_benefits` }],
                [{ text: '🍽 How to Use', callback_data: `info_${category}_${product}_use` }],
                [
                    { text: '🏠 Main', callback_data: 'start' },
                    { text: '🔙 Back', callback_data: `category_${category}` }
                ]
            ]
        }
    };
};

// Start command
bot.onText(/\/start/, (msg) => {
    sendMessage(msg.chat.id, '📌 *Welcome to Tenith Healthy Foods!* \n\nSelect a category:', {
        parse_mode: 'Markdown',
        ...getMainMenu()
    });
});

// Handle category selection
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data.startsWith('category_')) {
        const category = data.replace('category_', '');
        sendMessage(chatId, `📌 *${category}* \n\nSelect a product:`, {
            parse_mode: 'Markdown',
            ...getProductMenu(category)
        });
    } else if (data.startsWith('product_')) {
        const [, category, product] = data.split('_');
        const productInfo = productData[category].products[product];
        sendMessage(chatId, `⭐ *${product}*\n\n💰 ${productInfo.price}\n🧴 Bottle Packaging: ${productInfo.bottle_packaging}`, {
            parse_mode: 'Markdown',
            ...getProductDetailsMenu(category, product)
        });
    } else if (data.startsWith('info_')) {
        const [, category, product, infoType] = data.split('_');
        const infoTexts = {
            what: `📌 *What is ${product}?* \n\n${productData[category].products[product].what}`,
            benefits: `💡 *Benefits of ${product}* \n\n${productData[category].products[product].benefits}`,
            use: `🍽 *How to Use ${product}* \n\n${productData[category].products[product].use}`
        };
        sendMessage(chatId, infoTexts[infoType], {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏠 Main', callback_data: 'start' },
                        { text: '🔙 Back', callback_data: `product_${category}_${product}` }
                    ]
                ]
            }
        });
    } else if (data === 'contact') {
        sendMessage(chatId, `📍 *TENITH HEALTHY FOODS* \n\n🏠 *Address:* \n136, வண்ணியார் நகர், மெய்யனூர், சேலம், தமிழ்நாடு - 636004 \n\n📞 *Phone:* 9488710427 \n📩 *Email:* tenithhealthyfoods@gmail.com \n\n🌐 *Website:* [Visit Website](https://tenith-healthy.netlify.app) \n📷 *Instagram:* [@tenithhealthyfoods](https://instagram.com/tenithhealthyfoods)`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'start' }]] }
        });
    } else if (data === 'start') {
        sendMessage(chatId, '📌 *Welcome to Tenith Healthy Foods!* \n\nSelect a category:', {
            parse_mode: 'Markdown',
            ...getMainMenu()
        });
    }
});

console.log('🤖 Bot is running...');




const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual Telegram bot token
const bot = new Telegraf(process.env.BOT_TOKEN); // Use env variable

// const bot = new Telegraf("7759021545:AAGaPvoURbXd6ddhFCFyioUcFfQ9teKuvlI");

// Web server to keep Replit alive
app.get("/", (req, res) => {
    res.send("Bot is running!");
});

// Start Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Products List
const products = {
    "Idli / Dosa / Rice Mix Podi": [
        "Sambar Podi",
        "Rasam Podi",
        "Karuveppilai Podi",
    ],
    "Soup Podi": ["Tomato Soup", "Mushroom Soup", "Millet Soup"],
};

// Main Menu
bot.start((ctx) => {
    ctx.reply(
        "📌 *Welcome to Tenith Healthy Foods!* \n\nAt *Tenith Healthy Foods*, we provide *100% natural* and *preservative-free* products.",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "🍛 Idli / Dosa / Rice Mix Podi",
                    "category_idli_dosa",
                ),
            ],
            [Markup.button.callback("🥣 Soup Podi", "category_soup")],
            [Markup.button.callback("📞 Contact", "contact")],
        ]),
    );
});

// Handling Product Categories
bot.action(/^category_(.+)$/, (ctx) => {
    const category =
        ctx.match[1] === "idli_dosa"
            ? "Idli / Dosa / Rice Mix Podi"
            : "Soup Podi";
    const productButtons = products[category].map((product) => [
        Markup.button.callback(product, `product_${product}`),
    ]);

    ctx.editMessageText(
        `📌 *${category}* \n\nSelect a product:`,
        Markup.inlineKeyboard([
            ...productButtons,
            [Markup.button.callback("🔙 Back", "start")],
        ]),
    );
});

// Handling Product Selection
bot.action(/^product_(.+)$/, (ctx) => {
    const product = ctx.match[1];

    ctx.editMessageText(
        `✅ *You selected: ${product}*`,
        Markup.inlineKeyboard([
            [Markup.button.callback("❓ What?", `info_${product}_what`)],
            [Markup.button.callback("💡 Benefits", `info_${product}_benefits`)],
            [Markup.button.callback("🍽 How to Use", `info_${product}_use`)],
            [Markup.button.callback("🔙 Back", "start")],
        ]),
    );
});

// Handling Information Buttons
bot.action(/^info_(.+)_(.+)$/, (ctx) => {
    const product = ctx.match[1];
    const infoType = ctx.match[2];

    const infoText = {
        what: `📌 *What is ${product}?* \nThis is a natural product made from high-quality ingredients.`,
        benefits: `💡 *Benefits of ${product}* \n✅ 100% Natural \n✅ No preservatives \n✅ Healthy & Tasty`,
        use: `🍽 *How to Use ${product}* \nMix with warm water and enjoy!`,
    };

    ctx.editMessageText(
        infoText[infoType],
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "🔙 Back to Product",
                    `product_${product}`,
                ),
            ],
        ]),
    );
});

// Handling Contact
bot.action("contact", (ctx) => {
    ctx.editMessageText(
        "📍 *TENITH HEALTHY FOODS* \n\n🏠 *Address:* \n136, வண்ணியார் நகர், மெய்யனூர், சேலம், தமிழ்நாடு - 636004 \n\n📞 *Phone:* 9488710427 \n📩 *Email:* tenithhealthyfoods@gmail.com \n\n🌐 *Website:* [Visit Website](https://tenith-healthy.netlify.app) \n📷 *Instagram:* [@tenithhealthyfoods](https://instagram.com/tenithhealthyfoods)",
        Markup.inlineKeyboard([[Markup.button.callback("🔙 Back", "start")]]),
    );
});

// Handling Back Button
bot.action("start", (ctx) => {
    ctx.editMessageText(
        "📌 *Welcome to Tenith Healthy Foods!* \n\nAt *Tenith Healthy Foods*, we provide *100% natural* and *preservative-free* products.",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "🍛 Idli / Dosa / Rice Mix Podi",
                    "category_idli_dosa",
                ),
            ],
            [Markup.button.callback("🥣 Soup Podi", "category_soup")],
            [Markup.button.callback("📞 Contact", "contact")],
        ]),
    );
});

// Start Bot
bot.launch();
console.log("🤖 Bot is running...");
