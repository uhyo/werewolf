// initialize game.
import {
    Game,
    Package,
} from '../lib';
import {
    Player,
} from '../core/player';
import {
    Rule,
    Field,
    initField,
} from '../core/field';
import {
    Effect,
} from '../core/effect';

import coreActions from '../core/action';

type G = Game<Player, Effect, Field>;
type P = Package<Player, Effect, Field>;

// 拡張ルール
interface R extends Rule{
    // 時間系
    dayTime: number;   // 秒
    nightTime: number; // 秒
    additionalTime: number;
}

export {
    G as Game,
    P as Package,
    R as Rule,
};

export function initGame(rule: R, pkgs: Array<P>): G{
    const f = initField(rule);
    const game = new Game<Player, Effect, Field>(f);

    game.loadActions(coreActions);

    for (let p of pkgs){
        game.loadPackage(p);
    }
    return game;
}
