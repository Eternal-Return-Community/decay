import Webhook from "./Webhook";
import type iSeason from "./interface/iSeason";
import type iUserInfo from "./interface/iUserInfo";
import date from './date';
import Cache from "./Cache";
import { Elo } from "./enum/Elo";
import type { MatchingTeamMode } from "./enum/MatchingTeamMode";
import region from "./regions";
import DecayError from "./DecayError";

export default class Api {

    private readonly _headers = {
        headers: {
            'User-Agent': 'BestHTTP/2 v2.4.0',
            'Content-Type': 'application/json',
            'Host': 'bser-rest-release.bser.io',
            'X-BSER-AuthProvider': 'STEAM',
            'X-BSER-SessionKey': Bun.env.SESSION || '',
            'X-BSER-Version': Bun.env.PATCH_VERSION || ''
        }
    }

    constructor(
        private readonly _nickname: string,
        private readonly _matchingTeamMode: MatchingTeamMode
    ) { };

    private async season(): Promise<number> {
        const response = await fetch('https://bser-rest-release.bser.io/api/ranking/currentSeasonTiers', this._headers);

        const data = await response.json();
        const season: iSeason = data.rst.rankingSeason;

        const seasonEnd = date(season.endDtm);
        Cache.setSeason = season.id;

        if (season.title.startsWith('Pre-Season')) {
            throw new DecayError(`O jogo está na **Pre-season**. Durante a **Pre-season** os jogadores não irá dropar por inatividade. \nSeason vai começar **<t:${seasonEnd}:R>**`)
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
        if (data.code !== 200) throw new DecayError('Esse jogador não existe ou o servidor está em manutenção. \nQuando o servidor estiver offline os serviços da **NN** ficam indsponível');

        return data.user.userNum;
    }

    private async games(userNum: number): Promise<number> {
        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/games/${userNum}`, this._headers);
        const data = await response.json();

        if (data.cod !== 200) {
            Webhook()
            throw new DecayError('Ocorreu um erro interno (1)');
        }

        const lastGame = data.rst.battleUserGames.find((i: any) => i.matchingMode === this._matchingTeamMode);
        return Math.round(lastGame?.startDtm / 1000) || 0;
    }

    public async decay(): Promise<iUserInfo> {
        const seasonEnd = date() > Cache.getDate ? await this.season() : Cache.getDate;

        const userNum = await this.userNum();
        const lastGame = await this.games(userNum);
        
        const response = await fetch(`https://bser-rest-release.bser.io/api/battle/overview/other/${userNum}/${Cache.getSeason}`, this._headers);
        const data = await response.json();
        
        const rst = data.rst.battleUserInfo[this._matchingTeamMode];

        if ((rst?.mmr ?? Elo.IRON) < Elo.DIAMOND) throw new DecayError('Elo da conta é menor que **Diamante**. O sistema de inatividade não está disponível para sua conta.');

        const { playSeoulCount, playOhioCount, playFrankFurtCount, playSaoPauloCount, playAsia2Count } = rst;

        return {
            nickname: rst.battleUserStat?.nickname || this._nickname,
            daysRemaining: rst.deferPoint,
            lastGame,
            decayStart: (rst.dormantDtm / 1000) || 0,
            seasonEnd,
            region: region.account(rst.rankBindRegion),
            regionReward: region.reward({ playSeoulCount, playOhioCount, playFrankFurtCount, playSaoPauloCount, playAsia2Count })
        };
    }

}
