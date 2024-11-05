import SteamUser from 'steam-user';
import Cache from '../Cache';
import Api from './Api';

class Steam extends SteamUser {

    private readonly _accountName: string = process.env.LOGIN!;
    private readonly _password: string = process.env.PASSWORD!;
    private readonly _gameID: number = 1049590;

    constructor() {
        super({ autoRelogin: true })

        if (!this._accountName || !this._password) {
            throw new Error('Missing login or password in .env')
        }

        this.on('error', (err) => console.log('[SteamUser] -> ', err))

        this.on('disconnected', () => {
            if (!this.steamID) setTimeout(async () => await this.login(), 10 * 1000)
        })

    }

    public async login(): Promise<void> {
        this.logOn({ accountName: this._accountName, password: this._password })
        await this.getToken()
    }

    public async refreshTicket(): Promise<any> {
        const ticket = await this.cancelAuthSessionTickets(this._gameID, null)

        if (ticket.canceledTicketCount > 0) {
            await this.generateSessionTicket();
        }
    }

    public async getToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.on('loggedOn', async () => {
                await this.generateSessionTicket() ? resolve(true) : reject(false);
            })
        })
    }

    private async generateSessionTicket(): Promise<boolean> {
        const { sessionTicket } = await this.createAuthSessionTicket(this._gameID);
        if (!sessionTicket) return false;

        await ERBS.auth(this.getSessionTicket(sessionTicket))
        
        return true;
    }

    private getSessionTicket(sessionTicket: Buffer) {
        return sessionTicket.toString('hex').toUpperCase()
    }
}

class ERBS {
    public static async auth(authorizationCode: string): Promise<void> {
        const response = await Api.client('POST', '/users/authenticate', JSON.stringify({
            "dlc": "pt",
            "glc": "ko",
            "alc": "en",
            "la": 2,
            "ap": 'STEAM',
            "idt": authorizationCode,
            "prm": { authorizationCode },
            "ver": Cache.patch
        }))

        Cache.token = response.sessionKey
        this.renewalSession();
    }

    private static renewalSession = (): void => {
        setInterval(() => Api.client('POST', '/external/renewalSession'), 1 * 30000)
    }

    public static async getPatch(): Promise<void> {
        const response = await fetch('https://er.dakgg.io/api/v0/statistics/realtime')
        const data = await response.json();

        const patchNumber = String(data.meta.patch);
        const numbers = patchNumber.split('');

        const major = numbers.shift();
        const patch = numbers.pop();
        const minor = numbers.join('');

        Cache.patch = `${major}.${minor}.${patch}`;
    }
}

export default {
    steam: new Steam(),
    erbs: ERBS,
}