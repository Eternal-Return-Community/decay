const regions: Record<number, string> = {
    1: 'Dev',
    2: 'QA',
    5: 'Staging',
    6: 'Tournament',
    7: 'DevChina',
    10: 'Seoul',
    11: 'Tokyo',
    12: 'Ohio',
    13: 'FrankFurt',
    14: 'São Paulo',
    15: 'Singapore',
    16: 'HongKong',
    17: 'Asia2',
    99: 'Localhost',
    1000: 'Seoul',
    1001: 'Ohio',
    1002: 'Frankfurt',
    1003: 'SaoPaulo'
}

type RegionCount = {
    playSeoulCount: number;
    playFrankFurtCount: number;
    playOhioCount: number;
    playSaoPauloCount: number;
    playAsia2Count: number;
}

const reward = (region: RegionCount): string => {
    const regions = Object.entries(region).sort((a, b) => b[1] - a[1]);
    const [regionName] = regions[0];
    return regionName.replace(/(play|Count)/g, '');
}

export default {
    account: (x: number): string => regions[x] || 'Região desconhecida.',
    reward
}