import Championship from "../database/repositories/ChampionshipRepository";
import Api from "../services/Api"

export default {
    leaderboard: async () => {
        const [players, allPlayers] = await Promise.all([Api.leaderboard(), Championship.all()]);

        for (const player of players) {

            const playerExists = allPlayers.find(i => i.userName.toLowerCase() == player.nickname.toLowerCase());

            if (playerExists) {
                await Championship.update({
                    userNum: player.userNum,
                    userName: player.nickname,
                    mmr: player.mmr
                })
            }
        }
    }
}