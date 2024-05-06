import Webhook from "./Webhook";
import type userInfo from "./interface/iUserInfo";

export default class Api {

    private readonly _seasonID: number = 23;
    private readonly _patch: string = '1.20.0';
    private readonly _headers = {
        headers: {
            'User-Agent': 'BestHTTP/2 v2.4.0',
            'Content-Type': 'application/json',
            'Host': 'bser-rest-release.bser.io',
            'X-BSER-AuthProvider': 'STEAM',
            'X-BSER-SessionKey': Bun.env.SESSION!,
            'X-BSER-Version': this._patch
        }
    }

    constructor(private _nickname: string) { };

    private async userNum(): Promise<number> {
        const response = await fetch(`https://open-api.bser.io/v1/user/nickname?query=${this._nickname.toLocaleLowerCase().trim()}`, {
            headers: {
                'x-api-key': Bun.env.TOKEN!
            }
        });

        const data = await response.json();
        if (data.code !== 200) throw new Error('Esse jogador não existe.');

        return data.user.userNum;
    }

    private async games(userNum: number): Promise<number> {
        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/games/${userNum}`, this._headers);
        const data = await response.json();

        if (data.cod !== 200) {
            Webhook()
            throw new Error('Ocorreu um erro interno.');
        }

        const lastGame = data.rst.battleUserGames.find((i: any) => i.matchingMode === 3);
        return Math.round(lastGame?.startDtm / 1000) || 0;
    }

    public async decay(): Promise<userInfo> {
        const userNum = await this.userNum();
        const lastGame = await this.games(userNum);

        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/overview/other/${userNum}/${this._seasonID}`, this._headers);
        const data = await response.json();

        const rst = data.rst.battleUserInfo[3];

        if ((rst?.mmr ?? 0) < 4800) throw new Error('Elo da conta é menor que **Diamante**. O sistema de inatividade não está disponível para sua conta.');

        const userInfo: userInfo = {
            nickname: rst.battleUserStat.nickname,
            daysRemaining: rst.deferPoint,
            lastGame,
            decayStart: (rst.dormantDtm / 1000) || 0
        };

        return userInfo;
    }

}
