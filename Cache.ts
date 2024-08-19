export default class Cache {

    private static date: number = 0;
    private static season: number = 25;

    public static set setDate(date: number) {
        this.date = date;
    }

    public static get getDate(): number {
        return this.date;
    }

    public static set setSeason(season: number) {
        this.season = season;
    }

    public static get getSeason(): number {
        return this.season;
    }
}