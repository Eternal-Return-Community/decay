export default (d: string = new Date().toString()): number => {
    const date = new Date(d).getTime();
    return date / 1000;
}