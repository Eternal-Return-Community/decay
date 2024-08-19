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

export default (x: number): string => regions[x] || 'Região desconhecida.';