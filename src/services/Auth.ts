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

        this.logOn({ accountName: this._accountName, password: this._password })
        
        this.on('error', (err) => {
            console.log('[SteamUser - Error] -> ', err)
            this._relog()
        })
        
        this.on('disconnected', () => {
            console.log('[SteamUser - Disconnected]')
            this._relog()
        })
    }

    public async login(): Promise<void> {
        return new Promise((resolve) => {
            this.on('loggedOn', async () => {
                await this
                    .generateSessionTicket()
                    .catch(e => console.log(`[Steam - getToken] -> ${e?.message}`))
                resolve(undefined)
            })
        })
    }

    public async refreshTicket(): Promise<void> {
        await this.cancelAuthSessionTickets(this._gameID, null)
        await this.generateSessionTicket()
    }

    private async generateSessionTicket(): Promise<void> {
        const { sessionTicket } = await this.createAuthSessionTicket(this._gameID);
        if (!sessionTicket) throw new Error('You need to log into the game at least once on your Steam/ERBS account.');

        await ERBS.auth(this.getSessionTicket(sessionTicket))
    }

    private getSessionTicket(sessionTicket: Buffer): string {
        return sessionTicket.toString('hex').toUpperCase()
    }

    private _relog(): void {
        if (!this.steamID) setTimeout(() => this.login(), 10 * 1000)
    }
}

class ERBS {
    public static async auth(authorizationCode: string): Promise<void> {
        await this.getPatch();
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

        Cache.token = response?.sessionKey
        this.renewalSession();
    }

    private static renewalSession = (): void => {
        if (Cache.renewalSession) return;
        setInterval(() => Api.client('POST', '/external/renewalSession'), 1 * 30000)
        Cache.renewalSession = true;
    }

    public static async getPatch(): Promise<void> {
        const response = await fetch('https://er.dakgg.io/api/v0/statistics/realtime')
        const data = await response.json();

        const patchNumber = String(data.meta.patch);

        const major = patchNumber.substring(0, 1);
        const minor = patchNumber.substring(1, 3);
        const patch = patchNumber.substring(3, patchNumber.length);

        console.log(`[ERBS - Patch] -> ${major}.${minor}.${patch}`)
        Cache.patch = `${major}.${minor}.${patch}`;
    }
}

export default {
    STEAM: new Steam(),
    ERBS
}