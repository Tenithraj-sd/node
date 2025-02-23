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



