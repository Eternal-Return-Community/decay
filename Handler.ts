import type { Message } from "discord.js";
import type iHandler from "./interface/iHandler";
import type iUserInfo from "./interface/iUserInfo";
import Api from "./Api";

export default class Handler {

    private readonly _prefix: string = '!';
    private readonly _message: Message;

    constructor(private _handler: iHandler) {
        this._message = this._handler.message;
        this.command();
    };

    private async command(): Promise<void> {
        if (this._handler.commandName !== '!decay') return;
        await this.decay();
    }

    private async decay(): Promise<Message> {
        try {
            const userNickname = this._handler.content;
            if (!userNickname) return this._message.reply('* Use o comando dessa maneira: **!decay <nickname>**');

            const { nickname, daysRemaining, lastGame, decayStart, seasonEnd }: iUserInfo = await new Api(userNickname).decay();

            if (!daysRemaining) {
                return this._message.reply(`**${nickname}** está tomando decay. \nÚltimo game foi <t:${lastGame}:R>`);
            }

            if (daysRemaining == 15) {
                return this._message.reply(`**${nickname}**, tem os **15 dias** stackado.`);
            }

            const start = decayStart ? `**<t:${decayStart}:R>** foi removido um ponto de decay.` : '';
            return this._message.reply(`\`${nickname}\`, vai começar tomar decay em \`${daysRemaining} dia(s)\`. \`Season vai acabar\` **<t:${seasonEnd}:R>** \nÚltimo partida de \`${nickname}\` foi **${lastGame ? `<t:${lastGame}:R>` : '???'}**. ${start}`);

        } catch (e: any) {
            return this._message.reply(e.message);
        }
    }
}