export default class Cache {

    private static date: number = 0;

    public static set setDate(date: number) {
        this.date = date;
    }

    public static get getDate(): number {
        return this.date;
    }
}