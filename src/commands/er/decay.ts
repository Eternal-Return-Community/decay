import type { Message } from "discord.js";
import Api from "../../services/Api";
import type iUserInfo from "../../interface/iUserInfo";

export default {
    name: 'Decay',
    description: 'Comando para mostrar quantos dias de inatividade a conta ainda tem.',
    alias: ['d'],
    args: ['username'],
    status: {
        enable: true,
        reason: 'Correção de bug.'
    },
    async run(channel: Message, args: Array<string>, prefix: string): Promise<void> {
        const userNickname = args?.shift();
        if (!userNickname) {
            channel.reply(`* Use o comando dessa maneira: **${prefix}${this.alias.join(',')}, ${prefix}${this.name} <${this.args.join(', ')}>**`);
            return 
        }
        
        const bser = new Api(userNickname?.toLowerCase().trim());
        const { nickname, daysRemaining, lastGame, decayStart, seasonEnd, regionReward }: iUserInfo = await bser.decay();

        if (daysRemaining == 0) {
            channel.reply(`**${nickname}** está tomando decay. \nÚltimo game foi **${lastGame ? `<t:${lastGame}:R>` : '???'}**`);
            return 
        }

        if (daysRemaining >= 12) {
            channel.reply(`**${nickname}**, tem os **${daysRemaining} dias** stackados.`);
            return 
        }

        const start = decayStart > 0 ? `**<t:${decayStart}:R>** foi removido um ponto de decay.\n` : '';
        channel.reply(`\`${nickname}\`, vai começar tomar decay em \`${daysRemaining} dia(s)\`. \`Season vai acabar\` **<t:${seasonEnd}:R>** \nÚltimo partida de \`${nickname}\` foi **${lastGame ? `<t:${lastGame}:R>` : '???'}**. ${start}Região atual da conta: \`${regionReward}\``);
    }
}