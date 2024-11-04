export default class DecayError extends Error {
    constructor(public readonly message: string) {
        super(message);
    }
}