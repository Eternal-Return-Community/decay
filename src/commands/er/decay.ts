import type { Message } from "discord.js";
import DecayError from "../../exceptions/DecayError";
import Api from "../../services/Api";
import type iUserInfo from "../../interface/iUserInfo";

export default {
    name: 'decay',
    description: 'Comando para mostrar quantos dias de inatividade a conta ainda tem.',
    alias: ['d'],
    args: ['username'],
    enable: true,
    async run(channel: Message, args: Array<string>, prefix: string): Promise<Message> {
        try {

            const userNickname = args?.shift();
            if (!userNickname) return channel.reply(`* Use o comando dessa maneira: **${prefix}${this.alias.join(',')}, ${prefix}${this.name} <${this.args.join(', ')}>**`);

            const bser = new Api(userNickname?.toLowerCase().trim());
            const { nickname, daysRemaining, lastGame, decayStart, seasonEnd, regionReward }: iUserInfo = await bser.decay();

            if (daysRemaining == 0) {
                return channel.reply(`**${nickname}** está tomando decay. \nÚltimo game foi **${lastGame ? `<t:${lastGame}:R>` : '???'}**`);
            }

            if (daysRemaining >= 12) {
                return channel.reply(`**${nickname}**, tem os **${daysRemaining} dias** stackados.`);
            }

            const start = decayStart > 0 ? `**<t:${decayStart}:R>** foi removido um ponto de decay.\n` : '';
            return channel.reply(`\`${nickname}\`, vai começar tomar decay em \`${daysRemaining} dia(s)\`. \`Season vai acabar\` **<t:${seasonEnd}:R>** \nÚltimo partida de \`${nickname}\` foi **${lastGame ? `<t:${lastGame}:R>` : '???'}**. ${start}Região atual da conta: \`${regionReward}\``);

        } catch (e: unknown) {
            if (e instanceof DecayError) return channel.reply(e.message);
            return channel.reply('Ocorreu um erro interno (2)');
        }
    }
}