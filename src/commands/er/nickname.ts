import type { Message } from "discord.js";
import DecayError from "../../exceptions/DecayError";
import Api from "../../services/Api";

export default {
    name: 'nickname',
    description: 'Verificar se um determinado nickname está disponível ou não.',
    alias: ['n'],
    args: ['username'],
    enable: true,
    async run(channel: Message, args: Array<string>, prefix: string): Promise<Message> {
        try {
            const userName = args?.shift();
            if (!userName) return channel.reply(`* Use o comando dessa maneira: **${prefix}${this.alias.join(',')}, ${prefix}${this.name} <${this.args.join(', ')}>**`);

            if(userName.length < 3 || userName.length > 16) {
                return channel.reply('Nickname precisa ter no minimo 3 digitos e no máximo 16')
            }

            const bser = new Api(userName?.toLowerCase().trim());
            const isAvailable = await bser.nameChecker();

            return channel.reply((isAvailable ? `**${userName}** está disponível` : `**${userName}** não está disponível`) + ' para troca.')

        } catch (e: unknown) {
            if (e instanceof DecayError) return channel.reply(e.message);
            console.log('[Command - Nickname] -> ', e)
            return channel.reply('Ocorreu um erro interno (2)');
        }
    }
}