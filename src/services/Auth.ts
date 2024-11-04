import SteamUser from 'steam-user';
import Cache from '../Cache';
import Api from './Api';

interface iSteam {
    debug: boolean
}

export class Steam extends SteamUser {

    private readonly _accountName: string = Bun.env.LOGIN!;
    private readonly _password: string = Bun.env.PASSWORD!;
    private readonly _debug: boolean;

    constructor({ debug = false }: Partial<iSteam>) {
        super({ autoRelogin: true })

        this._debug = debug

        if (!this._accountName || !this._password) {
            throw new Error('Missing login or password in .env')
        }

        if (this._debug) this.on('debug', (e) => console.log('[DEBUG - Steam] ->', e))

        this.login()
    }

    private login(): void {
        this.logOn({ accountName: this._accountName, password: this._password })
        this.getToken()
    }

    private getToken(): void {
        this.on('loggedOn', async () => {
            const { sessionTicket } = await this.createAuthSessionTicket(1049590);
            if (!sessionTicket) throw new Error('You need to log into the game at least once on your Steam/ERBS account.');

            this.getSessionTicket(sessionTicket)

            const erbs = new ERBS();
            await erbs.auth(this.getSessionTicket(sessionTicket))
        })
    }

    private getSessionTicket(sessionTicket: Buffer) {
        return sessionTicket.toString('hex').toUpperCase()
    }
}

export class ERBS {
    public async auth(authorizationCode: string): Promise<void> {
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

        if (response === 'INVALID_VERSION') {
            await ERBS.getPatch();
            await this.auth(authorizationCode)
        }

        Cache.token = response.sessionKey;
        this.renewalSession();
    }

    private renewalSession = (): void => {
        setInterval(() => Api.client('POST', '/external/renewalSessio'), 1 * 30000)
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