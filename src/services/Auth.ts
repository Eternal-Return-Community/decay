import SteamUser from 'steam-user';
import Cache from '../Cache';
import Api from './Api';

interface iSteam {
    debug: boolean
}

export default {
    login: async (settings: iSteam = { debug: false }): Promise<void> => {
        await new Steam(settings).login();
    },
    relog: async (): Promise<void> => {
        await new Steam().refreshTicket();
    },
    getToken: async (): Promise<boolean> => {
        return await new Steam().getToken();
    },
    getPatch: async (): Promise<void> => await ERBS.getPatch()
}

class Steam extends SteamUser {

    private readonly _accountName: string = process.env.LOGIN!;
    private readonly _password: string = process.env.PASSWORD!;
    private readonly _debug: boolean;

    constructor({ debug }: iSteam = { debug: false }) {
        super({ autoRelogin: true })

        this._debug = debug

        if (!this._accountName || !this._password) {
            throw new Error('Missing login or password in .env')
        }

        if (this._debug) this.on('debug', (e) => console.log('[DEBUG - Steam] ->', e))
    }

    public async login(): Promise<void> {
        this.logOn({ accountName: this._accountName, password: this._password, autoRelogin: true })
        await this.getToken()
    }

    public async refreshTicket(): Promise<any> { 
        console.log(await this.cancelAuthSessionTickets(1049590))
    }

    public async getToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.on('loggedOn', async () => {
                try {
                    await this.generateSessionTicket() ? resolve(true) : reject(false);
                } catch (e) {
                    console.log(e)
                    reject(false)
                }
            })
        })
    }

    private async generateSessionTicket(): Promise<boolean> {
        const { sessionTicket } = await this.createAuthSessionTicket(1049590);
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