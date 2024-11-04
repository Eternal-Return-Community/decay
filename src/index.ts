import { Client, GatewayIntentBits } from 'discord.js';
import MessageCreate from './MessageCreate';
import { ERBS } from './services/Auth';

class Bot extends Client {

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        this.ready().message();
        this.login(Bun.env.BOT_TOKEN);
    }

    private ready(): this {
        return this.once('ready', async () => {
            await ERBS.getPatch();
            console.log('Bot online');
        });
    }

    private message() {
        this.on('messageCreate', (message) => new MessageCreate(message))
    }
}

new Bot();