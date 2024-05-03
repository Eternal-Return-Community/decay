import type { Message } from "discord.js"

export default interface Handler {
    message: Message;
    arg: string[];
    commandName: string;
    content: string;
}