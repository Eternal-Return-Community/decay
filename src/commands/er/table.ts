import type { Message } from "discord.js";
import ERBSChampionShip from "../../services/ERBSChampionShip";

export default {
    name: 'table',
    description: 'Verificar a tabela do SA',
    alias: ['t'],
    args: [],
    enable: true,
    async run(channel: Message): Promise<Message> {

        const table = new ERBSChampionShip('Eternal Return');
        const teams = await table.show()

        return channel.reply({ content: `\`\`\`${teams}\`\`\`` })
    }
}