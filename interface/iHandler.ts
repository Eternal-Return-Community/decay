import type { Message } from "discord.js"

export default interface iHandler {
    message: Message;
    arg: any;
    commandName: string;
    content: string
}