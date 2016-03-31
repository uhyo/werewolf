//Init game for test
import {Game} from '../../lib';
import {Player} from '../../core/player';
import {Rule, Field, initField} from '../../core/field';
import {Effect} from '../../core/effect';

import coreActions from '../../core/action';

export function makeRule():Rule{
    return {};
}

export function initGame(f:Field):Game<Player,Effect,Field>{
    const game = new Game<Player,Effect,Field>(f);

    game.loadActions(coreActions);

    return game;
}
