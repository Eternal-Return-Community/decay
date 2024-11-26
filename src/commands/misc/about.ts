import type { Message } from "discord.js";

export default {
    name: 'about',
    description: 'Sobre o projeto',
    alias: ['a'],
    args: [],
    status: {
        enable: true,
        reason: ''
    },
    async run(channel: Message): Promise<void> {
        channel.reply('Esse projeto é separado em 2 **repositórios**. A parte do **Eternal Return** tá disponível para receber contribuições através do **[GITHUB](https://github.com/Eternal-Return-Community/decay)** \nCaso queira adicionar algum comando que use **API** do **ERBS** não utilize a **API** **pública**. O projeto utiliza a **API** do próprio client do jogo. \nCaso precise de ajuda entre nesse **[SERVIDOR](https://discord.gg/7SC2syPPaJ)**')
    }
}