import Championship from "../database/repositories/ChampionshipRepository";
import Api from "../services/Api"

export default {
    leaderboard: async () => {
        const [players, allPlayers] = await Promise.all([Api.leaderboard(), Championship.all()]);

        for (const player of players) {

            const userNum = allPlayers.find(i => i.userNum == player.userNum)?.userNum;

            if (userNum) {
                await Championship.update({
                    userNum,
                    userName: player.nickname,
                    mmr: player.mmr
                })
            }
        }
    },
    start: function () {
        setInterval(async () => await this.leaderboard(), 10 * 6 * 10000)
    }
}