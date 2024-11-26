import type { Message } from "discord.js";
import Api from "../../services/Api";

export default {
    name: 'Nickname',
    description: 'Verificar se um determinado nickname está disponível ou não.',
    alias: ['n'],
    args: ['username'],
    status: {
        enable: true,
        reason: 'Correção de bug.'
    },
    async run(channel: Message, args: Array<string>, prefix: string): Promise<void> {
        const userName = args?.shift();

        if (!userName) {
            channel.reply(`* Use o comando dessa maneira: **${prefix}${this.alias.join(',')}, ${prefix}${this.name} <${this.args.join(', ')}>**`);
            return
        }

        if (userName.length < 3 || userName.length > 16) {
            channel.reply('Nickname precisa ter no minimo 3 digitos e no máximo 16')
            return
        }

        const bser = new Api(userName?.toLowerCase().trim());
        const isAvailable = await bser.nameChecker();

        channel.reply((isAvailable ? `**${userName}** está disponível` : `**${userName}** não está disponível`) + ' para troca.')
    }
}