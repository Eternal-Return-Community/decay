import type iSeason from "../interface/iSeason";
import type iUserInfo from "../interface/iUserInfo";
import date from '../util/date';
import Cache from "../Cache";
import { Elo } from "../enum/Elo";
import { MatchingTeamMode } from "../enum/MatchingTeamMode";
import region from "../util/regions";
import DecayError from "../exceptions/DecayError";
import Auth from "./Auth";

export default class Api {

    constructor(
        private readonly _nickname: string,
        private readonly _matchingTeamMode: MatchingTeamMode = MatchingTeamMode.SQUAD
    ) { };

    public static async client(method: string, endpoint: string, body?: string): Promise<any> {
        const response = await fetch('https://bser-rest-release.bser.io/api'.concat(endpoint), {
            method,
            headers: {
                'User-Agent': 'BestHTTP/2 v2.4.0',
                'Content-Type': 'application/json',
                'Host': 'bser-rest-release.bser.io',
                'X-BSER-AuthProvider': 'STEAM',
                'X-BSER-SessionKey': Cache.token,
                'X-BSER-Version': Cache.patch
            },
            body
        })

        const data = await response.json();

        if (data?.cod == 1006) throw new DecayError('**ERBS** entrou em manutenção.');

        if (data?.cod > 1000 && data?.cod <= 1110) {
            await Auth.steam.refreshTicket()
            return await this.client(method, endpoint, body)
        }

        return this.data(data.cod, data)
    }

    private static data(cod: number, x: any): any {
        return cod > 1000 ? x : x.rst
    }

    private async season(): Promise<number> {
        const response: iSeason = await Api.client('GET', '/ranking/currentSeasonTiers');

        const season = response.rankingSeason;
        const seasonEnd = date(season?.endDtm ?? 0);

        Cache.season = season.id;

        if (season.seasonType == 2) {
            throw new DecayError(`O jogo está na **Pre-season**. Durante a **Pre-season** os jogadores não irá dropar por inatividade. \nSeason vai começar **<t:${seasonEnd}:R>**`)
        }

        Cache.date = seasonEnd;
        return seasonEnd;
    }

    private async userNum(): Promise<number> {
        const response = await Api.client('GET', `/users/other/simple/nickname/${this._nickname}`);
        if (response.user.un === 0) throw new DecayError('Esse jogador não existe ou o servidor tá em manutenção. \nQuando o servidor estiver offline os serviços da **NN** ficam indsponível');
        return response.user.un;
    }

    private async games(userNum: number): Promise<number> {
        const response = await Api.client('GET', `/battle/games/${userNum}`);
        const lastGame = response.battleUserGames.find((i: any) => i.matchingMode === this._matchingTeamMode);
        return Math.round(lastGame?.startDtm / 1000) || 0;
    }

    public async decay(): Promise<iUserInfo> {
        const seasonEnd = date() > Cache.date ? await this.season() : Cache.date;

        const userNum = await this.userNum();
        const lastGame = await this.games(userNum);

        const response = await Api.client('GET', `/battle/overview/other/${userNum}/${Cache.season}`);
        const rst = response.battleUserInfo[this._matchingTeamMode];

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

    public async nameChecker(): Promise<boolean> {
        const response = await Api.client('POST', '/users/purchase/changeNickname',
            JSON.stringify({ 'productId': 'ACCOUNT_Change_Nickname', 'salePurchase': false, 'newNickname': this._nickname })
        );

        if (response?.cod == 1111) return false;
        return true;
    }
}
