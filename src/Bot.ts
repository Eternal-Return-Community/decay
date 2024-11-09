import { Client, GatewayIntentBits } from 'discord.js';
import MessageCreate from './MessageCreate';
import Auth from './services/Auth';

export default class Bot extends Client {

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        this.ready().message();
    }

    private ready(): this {
        return this.once('ready', async () => {
            await Auth.steam.login();
            console.log('Bot online');
        });
    }

    private message(): void {
        this.on('messageCreate', (message) => new MessageCreate(message))
    }

    public start(): void {
        this.login(process.env.BOT_TOKEN);
    }
}