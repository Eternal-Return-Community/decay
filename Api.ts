import type userInfo from "./interface/iUserInfo";

export default class Api {

    private readonly _seasonID: number = 23;
    private readonly _patch: string = '1.20.0';

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

    public async ranked(): Promise<userInfo> {
        const userName = await this.userNum();
        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/overview/other/${userName}/${this._seasonID}`, {
            headers: {
                'User-Agent': 'BestHTTP/2 v2.4.0',
                'Content-Type': 'application/json',
                'Host': 'bser-rest-release.bser.io',
                'X-BSER-AuthProvider': 'STEAM',
                'X-BSER-SessionKey': Bun.env.SESSION!,
                'X-BSER-Version': this._patch
            }
        });

        const data = await response.json();
        if (data.cod !== 200) throw new Error('Token da Api expirou.');

        const rst = data.rst.battleUserInfo[3];

        if (rst.mmr < 4800) throw new Error('Elo da conta é menor que **Diamante**. O sistema de inatividade não está disponível para sua conta.');

        const userInfo: userInfo = {
            nickname: rst.battleUserStat.nickname,
            daysRemaining: rst.deferPoint,
            lastGame: rst.updateDtm / 1000,
            decayStart: rst?.dormantDtm ? rst.dormantDtm / 1000 : 0
        };

        return userInfo;
    }

}
