import type { Message } from "discord.js";
import ERBSChampionShip from "../../services/ERBSChampionShip";

export default {
    name: 'Table',
    description: 'Verificar a tabela do SA',
    alias: ['t'],
    args: [],
    status: {
        enable: false,
        reason: 'As inscrições foram finalizadas. O comando será reativado na próxima season.'
    },
    async run(channel: Message): Promise<void> {
        const teams = await ERBSChampionShip.show()
        channel.reply({ content: `\`\`\`${teams}\`\`\`` })
    }
}