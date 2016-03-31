///<reference path="../../typings/bundle.d.ts" />

import {initGame, makeRule} from './init-game';
import {Game} from '../../lib';
import {Player, initPlayer} from '../../core/player';
import {Field,Rule,
        PHASE_DAY, PHASE_NIGHT} from '../../core/field';
import {Effect} from '../../core/effect';
import * as eventname from '../../core/event/name';
import * as eventtype from '../../core/event/type';


describe("Events",()=>{
    let game:Game<Player,Effect,Field>;
    let rule:Rule = makeRule();
    beforeEach(()=>{
        game = initGame({
            rule: {},
            phase: null,
            day: 0,
            votebox: {}
        });
    });
    describe("Phase Events",()=>{
        it("EVENT_PHASE_DAY",()=>{
            game.runAllEvents({
                type: eventname.EVENT_PHASE_DAY
            });
            expect(game.getField()).toEqual({
                rule,
                phase: PHASE_DAY,
                day: 1,
                votebox: {}
            });
        });

        it("EVENT_PHASE_NIGHT",()=>{
            game.runAllEvents({
                type: eventname.EVENT_PHASE_NIGHT
            });
            expect(game.getField()).toEqual({
                rule,
                phase: PHASE_NIGHT,
                day: 0,
                votebox: {}
            });
        });
    });
    describe("Die Event",()=>{
        it("EVENT_DIE",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: "TODO"
            }));
            game.addPlayer(initPlayer({
                id: "id2",
                type: "TODO"
            }));
            game.addPlayer(initPlayer({
                id: "id3",
                type: "TODO"
            }));
            game.runAllEvents({
                type: eventname.EVENT_DIE,
                on: "id1",
                reason: "foo"
            } as eventtype.DieEvent);
            expect(game.getPlayers().get("id1").dead).toBe(true);
            expect(game.getPlayers().get("id1").dead_reason).toBe("foo");
            expect(game.getPlayers().get("id2").dead).toBe(false);
            expect(game.getPlayers().get("id3").dead).toBe(false);
        });
    });
});
