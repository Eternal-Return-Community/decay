import type { Message } from "discord.js";
import ERBSChampionShip from "../../services/ERBSChampionShip";
import DecayError from "../../exceptions/DecayError";

export default {
    name: 'table',
    description: 'Verificar a tabela do SA',
    alias: ['b'],
    args: [],
    enable: true,
    async run(channel: Message): Promise<Message> {
        try {
            const teams = await ERBSChampionShip.show()
            return channel.reply({ content: `\`\`\`${teams}\`\`\`` })
        } catch (e: unknown) {
            if (e instanceof DecayError) return channel.reply(e.message);
            console.log('[Command - Table] -> ', e)
            return channel.reply('Ocorreu um erro interno (2)');
        }
    }
}