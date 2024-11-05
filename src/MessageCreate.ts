import type { Message } from "discord.js";
import fs from 'node:fs';
import Cache from "./Cache";

export interface iCommand {
    default: Default
}

interface Default {
    name: string;
    description: string;
    alias: Array<string>;
    args: Array<string>;
    enable: boolean
    run(channel: Message, args: Array<string>, prefix: string): void
}

export default class MessageCreate {

    private readonly _prefix: string = '!';
    private readonly _args: Array<string>;
    private readonly _commandName: string;

    constructor(
        private _channel: Message
    ) {

        this._args = this._channel.content.split(' ');
        this._commandName = this._args[0].trim().toLowerCase();

        if (!this._commandName.startsWith(this._prefix)) return;
        this._args.shift();
        this.run()
    }

    private dirs(dir: string): Array<string> {
        return fs.readdirSync(dir)
    }

    private async run(): Promise<any> {
        for (const dir of this.dirs(`./src/commands`)) {
            const commands = this.dirs(`./src/commands/${dir}`);
            for (const cmd of commands) {

                if (!cmd.endsWith('.ts')) continue;

                const { default: command }: iCommand = await import(`./commands/${dir}/${cmd}`);

                if (!command) continue;
                if (!this.validateCommand(command)) continue;

                if (!command?.enable) {
                    return this._channel.reply({ content: `O comando **${command.name}** foi desativado temporariamente.` })
                }

                console.log('Cache -> ', Cache)
                return command.run(this._channel, this._args, this._prefix);
            }
        }

    }

    private validateCommand = (command: Default): boolean =>
        this._commandName.slice(this._prefix.length) === command.name ||
        command.alias.includes(this._commandName.slice(this._prefix.length))
}