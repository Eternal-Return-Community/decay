import { Client, GatewayIntentBits } from 'discord.js';
import Handler from './Handler';

class Bot extends Client {

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        this.ready().message();
        this.login(Bun.env.BOT_TOKEN);
    }

    private ready(): this {
        return this.once('ready', () => {
            console.log('Bot online');
        });
    }

    private message(): this {
        return this.on('messageCreate', async (message) => {

            if (!message.content.startsWith('!')) return;
            if (message.author.bot) return;

            const arg = message.content.split(' ');
            const commandName = arg[0].toLocaleLowerCase().trim();
            const content = arg[1];

            new Handler({
                message,
                arg,
                commandName,
                content
            });
        })
    }
}

new Bot();