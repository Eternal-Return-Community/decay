import type { Message } from "discord.js";
import type iHandler from "./interface/iHandler";
import type iUserInfo from "./interface/iUserInfo";
import Api from "./Api";

export default class Handler {

    private readonly _prefix: string = '!';

    constructor(private _handler: iHandler) {
        this.command();
    };

    private async command(): Promise<void> {
        if (this._handler.commandName !== '!decay') return;
        await this.decay();
    }

    private async decay(): Promise<Message> {
        try {

            const userNickname = this._handler.content;
            if (!userNickname) return this._handler.message.reply('* Use o comando dessa maneira: **!decay <nickname>**');

            const { nickname, daysRemaining, lastGame, decayStart }: iUserInfo = await new Api(userNickname).decay();

            if (!daysRemaining) {
                return this._handler.message.reply(`**${nickname}** está tomando decay. \nÚltimo game foi <t:${lastGame}:R>`);
            }

            if (daysRemaining == 15) {
                return this._handler.message.reply(`**${nickname}**, tem os **15 dias** stackado.`);
            }

            const start = decayStart ? `<t:${decayStart}:R> foi removido um ponto de decay.` : '';
            return this._handler.message.reply(`**${nickname}**, vai começar tomar decay em **${daysRemaining} dia(s)**. Conta atualmente possui **${daysRemaining} dia(s) stackado**. \nÚltimo partida de **${nickname}** foi ${lastGame ? `<t:${lastGame}:R>` : '**???**'} \n${start} `);

        } catch (e: any) {
            return this._handler.message.reply(e.message);
        }
    }
}