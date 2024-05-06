import type { Message } from "discord.js"

export default interface Handler {
    message: Message
    arg: any
    commandName: string,
    content: string,
}