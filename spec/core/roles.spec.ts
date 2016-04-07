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
import roleSeer from '../../core/roles/seer';
import roleMedium from '../../core/roles/medium';
import * as seerevent from '../../core/roles/seer.event';
import * as mediumevent from '../../core/roles/medium.event';

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
        game.loadPackage(roleSeer);
        game.loadPackage(roleMedium);
    });
    describe("Werewolf",()=>{
        it("Werewolf counts as werewolf",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: roleWerewolf.role
            }));
            const e = game.runEvent(events.initQueryCountEvent("id1"));
            expect(e.count).toBe(count.COUNT_WEREWOLF);
        });
    });
    describe("Seer",()=>{
        describe("EVENT_QUERY_SEER",()=>{
            it("init with SEER_RESULT_HUMAN",()=>{
                expect(seerevent.initQuerySeerEvent({
                    from: "id1",
                    to: "id2"
                })).toEqual({
                    type: seerevent.EVENT_QUERY_SEER,
                    from: "id1",
                    to: "id2",
                    result: seerevent.SEER_RESULT_HUMAN
                });
            });
            it("Werewolf seen with result of SEER_RESULT_WEREWOLF",()=>{
                game.addPlayer(initPlayer({
                    id: "id1",
                    type: roleSeer.role
                }));
                game.addPlayer(initPlayer({
                    id: "id2",
                    type: roleWerewolf.role
                }));
                const e = game.runEvent(seerevent.initQuerySeerEvent({
                    from: "id1",
                    to: "id2"
                }));
                expect(e.result).toBe(seerevent.SEER_RESULT_WEREWOLF);
            });
        });
    });
    describe("Medium",()=>{
        describe("EVENT_QUERY_MEDIUM",()=>{
            it("init with MEDIUM_RESULT_HUMAN",()=>{
                expect(mediumevent.initQueryMediumEvent({
                    from: "id1",
                    to: "id2"
                })).toEqual({
                    type: mediumevent.EVENT_QUERY_MEDIUM,
                    from: "id1",
                    to: "id2",
                    result: mediumevent.MEDIUM_RESULT_HUMAN
                });
            });
            it("Werewolf mediumed with result of MEDIUM_RESULT_WEREWOLF",()=>{
                game.addPlayer(initPlayer({
                    id: "id1",
                    type: roleMedium.role
                }));
                game.addPlayer(initPlayer({
                    id: "id2",
                    type: roleWerewolf.role
                }));
                const e = game.runEvent(mediumevent.initQueryMediumEvent({
                    from: "id1",
                    to: "id2"
                }));
                expect(e.result).toBe(mediumevent.MEDIUM_RESULT_WEREWOLF);
            });
        });
    });
});
