///<reference path="../../typings/bundle.d.ts" />

import {initGame, makeRule} from './init-game';
import {Game} from '../../lib';
import {Player, initPlayer} from '../../core/player';
import {Field,Rule,
        PHASE_DAY, PHASE_NIGHT} from '../../core/field';
import {Effect} from '../../core/effect';
import * as events from '../../core/events';
import * as votebox from '../../core/lib/votebox';
import * as count from '../../core/lib/count';
import * as diereason from '../../core/lib/diereason';

import roleWerewolf from '../../core/roles/werewolf';

describe("Roles",()=>{
    let game:Game<Player,Effect,Field>;
    let rule:Rule = makeRule();
    beforeEach(()=>{
        game = initGame({
            rule: {},
            phase: null,
            day: 0,
            votebox: {}
        });
        game.loadPackage(roleWerewolf);
    });
    describe("Werewolf",()=>{
        it("Werewolf counts as werewolf",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: roleWerewolf.role
            }));
            const e = game.runAllEvents(events.initQueryCountEvent("id1")) as events.QueryCountEvent;
            expect(e.count).toBe(count.COUNT_WEREWOLF);
        });
    });
});
