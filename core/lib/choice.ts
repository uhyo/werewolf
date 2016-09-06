import {
    Players,
} from '../player';
// 選択肢まわりのあれこれ
export interface Choice{
    // 選択肢のvalue
    value: string;
    // 選択肢の表示
    label: string;
    // 表示の種類(localizeに使用)
    label_kind: 'player' | 'string';
}

// 生存プレイヤーのリストを選択肢にする
export function alivePlayerOptions(players: Players): Array<Choice>{
    const alives = players.asArray().filter(({dead})=>!dead);
    return alives.map(({id})=>({
        label: id,
        label_kind: 'player',
        value: id,
    }) as Choice);
}
