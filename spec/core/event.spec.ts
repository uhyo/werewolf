///<reference path="../../typings/bundle.d.ts" />

import {initGame, makeRule} from './init-game';
import {Game} from '../../lib';
import {Player, initPlayer} from '../../core/player';
import {Field,Rule,
        PHASE_DAY, PHASE_NIGHT} from '../../core/field';
import {Effect} from '../../core/effect';
import * as eventname from '../../core/event/name';
import * as eventtype from '../../core/event/type';
import * as votebox from '../../core/lib/votebox';
import * as diereason from '../../core/lib/diereason';


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
    describe("Voting Events",()=>{
        it("EVENT_VOTE",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: "TODO"
            }));
            game.addPlayer(initPlayer({
                id: "id2",
                type: "TODO"
            }));
            game.runAllEvents({
                type: eventname.EVENT_VOTE,
                from: "id1",
                to: "id2",
                num: 1,
                priority: 0
            } as eventtype.VoteEvent);
            const v=game.getField().votebox;
            expect(v).toEqual({
                id1: {
                    from: "id1",
                    to: "id2",
                    num: 1,
                    priority: 0
                }
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
        it("EVENT_DIE don't override reason",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: "TODO"
            }));
            game.runAllEvents({
                type: eventname.EVENT_DIE,
                on: "id1",
                reason: "foo"
            } as eventtype.DieEvent);
            game.runAllEvents({
                type: eventname.EVENT_DIE,
                on: "id1",
                reason: "bar"
            } as eventtype.DieEvent);
            expect(game.getPlayers().get("id1").dead_reason).toBe("foo");
        });
    });
    describe("Lynch Events",()=>{
        describe("EVENT_LYNCH",()=>{
            beforeEach(()=>{
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
            });
            it("Lynch result is NONE",()=>{
                const e = game.runAllEvents({
                    type: eventname.EVENT_LYNCH
                }) as eventtype.LynchEvent;
                expect(e.voteResult).toBe(votebox.VOTERESULT_NONE);
            });
            it("Lynch result is CHOSEN",()=>{
                //votes
                game.runAllEvents({
                    type: eventname.EVENT_VOTE,
                    from: "id1",
                    to: "id2",
                    num: 1,
                    priority: 0
                } as eventtype.VoteEvent);
                game.runAllEvents({
                    type: eventname.EVENT_VOTE,
                    from: "id2",
                    to: "id1",
                    num: 1,
                    priority: 0
                } as eventtype.VoteEvent);
                game.runAllEvents({
                    type: eventname.EVENT_VOTE,
                    from: "id3",
                    to: "id2",
                    num: 1,
                    priority: 0
                } as eventtype.VoteEvent);
                //lynch
                const e = game.runAllEvents({
                    type: eventname.EVENT_LYNCH
                }) as eventtype.LynchEvent;
                expect(e.voteResult).toBe(votebox.VOTERESULT_CHOSEN);
                const p = game.getPlayers().get("id2");
                expect(p.dead).toBe(true);
                expect(p.dead_reason).toBe(diereason.LYNCH);
            });
        });
    });
});
