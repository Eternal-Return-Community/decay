import { AsciiTable3 } from "ascii-table3";
import type iPlayer from "../database/repositories/interface/iPlayer";
import Championship from "../database/repositories/ChampionshipRepository";
import routine from "../routine/routine";

class ERBSChampionShip extends AsciiTable3 {

    constructor(public readonly title: string) {
        super(title)
    }

    public async teams(): Promise<Array<string[][]>> {

        const rows: Array<string[][]> = [];

        const teams = await Championship.all();
        const team = Object.groupBy(teams, (i) => i.teamId);

        Object.keys(team).forEach((i) => {
            const byMMR = this.orderByMMR(team[Number(i)]!);
            rows.push([
                [''],
                this.allPlayers(byMMR),
                [byMMR.map(i => i.mmr).splice(0, 3).join(' | ')],
                this.totalMMR(byMMR)
            ])
        })

        return this.matrix(rows)
    }

    private matrix(rows: Array<string[][]>): Array<string[][]> {
        return rows
            .sort((a, b) => Number(b[3][0]) - Number(a[3][0]))
            .map((r, i) => {
                r[0] = this.rank(i + 1)
                return r
            })
    }

    private rank(i: number): Array<string> {
        return [(i > 8 ? `🡳 ${i}` : i.toString())]
    }

    private allPlayers(players: Array<iPlayer>): Array<string> {
        return [players.map(i => i.userName).slice(0, 3).join(', ')];
    }

    private orderByMMR(players: Array<iPlayer>): Array<iPlayer> {
        return players.sort((a, b) => b.mmr! - a.mmr!);
    }

    private totalMMR(players: Array<iPlayer>): Array<string> {
        const total = this.orderByMMR(players).splice(0, 3).reduce((mmr, player) => mmr + player.mmr!, 0);
        return [String(Math.round(total / 3))]
    }

    private table(rows: Array<string[][]>): AsciiTable3 {
        return this
            .setHeading('#', 'TOP 3', 'MMR\'s', 'MÉDIA')
            .addRowMatrix(rows)
    }

    public async show(): Promise<string> {
        await routine.leaderboard();
        const teams = await this.teams();
        return this.table(teams).toString()
    }

}

export default new ERBSChampionShip('Eternal Return')