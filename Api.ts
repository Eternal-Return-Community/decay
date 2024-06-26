import Webhook from "./Webhook";
import type Season from "./interface/iSeason";
import type UserInfo from "./interface/iUserInfo";
import date from './date';
import Cache from "./Cache";

export default class Api {

    private readonly _patch: string = Bun.env.PATCH_VERSION!;
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

    private async season(): Promise<number> {
        const response = await fetch('https://open-api.bser.io/v2/data/Season', {
            headers: {
                'x-api-key': Bun.env.TOKEN!
            }
        });

        const { data } = await response.json();
        const season = data.find((i: Season) => i.isCurrent);

        const seasonEnd = date(season.seasonEnd);
        Cache.setSeason = season.seasonID;

        if (season.seasonName.startsWith('Pre-Season')) {
            throw new Error(`O jogo está na **Pre-season**. Durante a **Pre-season** os jogadores não irá dropar por inatividade. \nSeason vai começar **<t:${seasonEnd}:R>**`)
        }

        Cache.setDate = seasonEnd;
        return seasonEnd;
    }

    private async userNum(): Promise<number> {
        const response = await fetch(`https://open-api.bser.io/v1/user/nickname?query=${this._nickname.toLocaleLowerCase().trim()}`, {
            headers: {
                'x-api-key': Bun.env.TOKEN!
            }
        });

        const data = await response.json();
        if (data.code !== 200) throw new Error('Esse jogador não existe ou o servidor está em manutenção. \nQuando o servidor estiver offline os serviços da **NN** ficam indsponível');

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

    public async decay(): Promise<UserInfo> {
        const seasonEnd = date() > Cache.getDate ? await this.season() : Cache.getDate;
        const userNum = await this.userNum();
        const lastGame = await this.games(userNum);

        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/overview/other/${userNum}/${Cache.getSeason}`, this._headers);
        const data = await response.json();

        const rst = data.rst.battleUserInfo[3];

        if ((rst?.mmr ?? 0) < 5200) throw new Error('Elo da conta é menor que **Diamante**. O sistema de inatividade não está disponível para sua conta.');

        const userInfo: UserInfo = {
            nickname: rst.battleUserStat?.nickname ?? this._nickname,
            daysRemaining: rst.deferPoint,
            lastGame,
            decayStart: (rst.dormantDtm / 1000) || 0,
            seasonEnd
        };

        return userInfo;
    }

}
