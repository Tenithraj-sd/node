const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('7759021545:AAGaPvoURbXd6ddhFCFyioUcFfQ9teKuvlI'); // Replace with your bot token

// Products List
const products = {
    "Idli / Dosa / Rice Mix Podi": ["Sambar Podi", "Rasam Podi", "Karuveppilai Podi"],
    "Soup Podi": ["Tomato Soup", "Mushroom Soup", "Millet Soup"]
};

// Main Menu
bot.start((ctx) => {
    ctx.reply(
        "📌 *Welcome to Tenith Healthy Foods!* \n\nAt *Tenith Healthy Foods*, we provide *100% natural* and *preservative-free* products.",
        Markup.inlineKeyboard([
            [Markup.button.callback("🍛 Idli / Dosa / Rice Mix Podi", "category_idli_dosa")],
            [Markup.button.callback("🥣 Soup Podi", "category_soup")],
            [Markup.button.callback("📞 Contact", "contact")]
        ])
    );
});

// Handling Product Categories
bot.action(/^category_(.+)$/, (ctx) => {
    const category = ctx.match[1] === "idli_dosa" ? "Idli / Dosa / Rice Mix Podi" : "Soup Podi";
    const productButtons = products[category].map(product => [Markup.button.callback(product, `product_${product}`)]);

    ctx.editMessageText(
        `📌 *${category}* \n\nSelect a product:`,
        Markup.inlineKeyboard([...productButtons, [Markup.button.callback("🔙 Back", "start")]])
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
            [Markup.button.callback("🔙 Back", "start")]
        ])
    );
});

// Handling Information Buttons
bot.action(/^info_(.+)_(.+)$/, (ctx) => {
    const product = ctx.match[1];
    const infoType = ctx.match[2];

    const infoText = {
        "what": `📌 *What is ${product}?* \nThis is a natural product made from high-quality ingredients.`,
        "benefits": `💡 *Benefits of ${product}* \n✅ 100% Natural \n✅ No preservatives \n✅ Healthy & Tasty`,
        "use": `🍽 *How to Use ${product}* \nMix with warm water and enjoy!`
    };

    ctx.editMessageText(
        infoText[infoType],
        Markup.inlineKeyboard([
            [Markup.button.callback("🔙 Back to Product", `product_${product}`)]
        ])
    );
});

// Handling Contact
bot.action("contact", (ctx) => {
    ctx.editMessageText(
        "📍 *TENITH HEALTHY FOODS* \n\n🏠 *Address:* \n136, வண்ணியார் நகர், மெய்யனூர், சேலம், தமிழ்நாடு - 636004 \n\n📞 *Phone:* 9488710427 \n📩 *Email:* tenithhealthyfoods@gmail.com \n\n🌐 *Website:* [Visit Website](https://tenith-healthy.netlify.app) \n📷 *Instagram:* [@tenithhealthyfoods](https://instagram.com/tenithhealthyfoods)",
        Markup.inlineKeyboard([
            [Markup.button.callback("🔙 Back", "start")]
        ])
    );
});

// Handling Back Button
bot.action("start", (ctx) => {
    ctx.editMessageText(
        "📌 *Welcome to Tenith Healthy Foods!* \n\nAt *Tenith Healthy Foods*, we provide *100% natural* and *preservative-free* products.",
        Markup.inlineKeyboard([
            [Markup.button.callback("🍛 Idli / Dosa / Rice Mix Podi", "category_idli_dosa")],
            [Markup.button.callback("🥣 Soup Podi", "category_soup")],
            [Markup.button.callback("📞 Contact", "contact")]
        ])
    );
});

// Start Bot
bot.launch();
