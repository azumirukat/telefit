const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome to TeleFit! Use /help to see available commands.');
});

bot.onText(/\/help/, (msg) => {
    const helpMessage = `
    Available commands:
    /start - Welcome message
    /help - List of commands
    /bmi <height> <weight> - Calculate BMI
    /calories - Track calorie intake and expenditure
    /workout - Get workout suggestions
    `;
    bot.sendMessage(msg.chat.id, helpMessage);
});

bot.onText(/\/bmi (\d+) (\d+)/, (msg, match) => {
    const height = parseFloat(match[1]);
    const weight = parseFloat(match[2]);
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    bot.sendMessage(msg.chat.id, `Your BMI is ${bmi.toFixed(2)}`);
});

bot.onText(/\/calories/, (msg) => {
    bot.sendMessage(msg.chat.id, 'This feature is under development. Please check back later.');
});

bot.onText(/\/workout/, (msg) => {
    bot.sendMessage(msg.chat.id, 'This feature is under development. Please check back later.');
});

module.exports = bot;
