export default (d: number | Date = new Date()): number => {
    const date = new Date(d).getTime();
    return date / 1000;
}