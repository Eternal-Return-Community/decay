import { Client, GatewayIntentBits } from 'discord.js';
import MessageCreate from './MessageCreate';
import Auth from './services/Auth';

export default class Bot extends Client {

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        this.start()
    }

    private ready(): this {
        return this.once('ready', () => {
            Auth.login();
            console.log('Bot online');
        });
    }

    private message(): void {
        this.on('messageCreate', (message) => new MessageCreate(message))
    }

    private start(): void {
        this.ready().message();
        this.login(process.env.BOT_TOKEN);
    }
}