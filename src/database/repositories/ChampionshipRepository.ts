import client from "../client";
import type iPlayer from "./interface/iPlayer";
import type iTeam from "./interface/iTeam";

export default class Championship {
    public static async insert(player: iTeam): Promise<void> {
        await client.championship.create({
            data: {
                teams: {
                    create: {
                        userName: player.userName,
                    }
                }
            }
        })
    }

    public static async inserPlayer(player: iPlayer): Promise<void> {
        await client.championship.update({
            where: {
                id: player.teamId
            },
            data: {
                teams: {
                    create: {
                        userName: player.userName,
                    }
                }
            }
        })
    }

    public static async removerPlayer(userName: string): Promise<void> {
        await client.teams.delete({
            where: {
                userName
            }
        })
    }

    public static async update(player: Partial<iPlayer>): Promise<void> {
        const userNameExist = await client.teams.findUnique({
            where: { userName: player.userName! }
        })

        const data = userNameExist ? { mmr: player.mmr } : {
            userName: player.userName,
            mmr: player.mmr
        }

        await client.teams.update({ where: { userNum: player.userNum! }, data })
    }

    public static async all(): Promise<Array<iPlayer>> {
        return await client.teams.findMany({
            orderBy: {
                teamId: 'desc'
            },
            select: {
                id: false,
                userName: true,
                userNum: true,
                mmr: true,
                teamId: true
            },
        })
    }

    public static async deleteAll(): Promise<void> {
        await client.championship.deleteMany();
    }

    public static async deleteTeamId(teamId: number): Promise<void> {
        await client.championship.delete({
            where: {
                id: teamId
            }
        })
    }

    public static async deleteTeam(teamId: number): Promise<void> {
        await client.teams.deleteMany({
            where: {
                teamId
            }
        });

        await this.deleteTeamId(teamId)
    }
}