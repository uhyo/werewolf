///<reference path="../../typings/bundle.d.ts" />

import {initGame, makeRule} from './init-game';
import {Game} from '../../lib';
import {Player, initPlayer} from '../../core/player';
import {Field,Rule,
        PHASE_DAY, PHASE_NIGHT} from '../../core/field';
import {Effect} from '../../core/effect';
import * as events from '../../core/events';
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
        it("initPhaseDayEvent",()=>{
            expect(events.initPhaseDayEvent()).toEqual({
                type: events.EVENT_PHASE_DAY
            });
        });
        it("initPhaseNightEvent",()=>{
            expect(events.initPhaseNightEvent()).toEqual({
                type: events.EVENT_PHASE_NIGHT
            });
        });
        it("EVENT_PHASE_DAY",()=>{
            game.runAllEvents(events.initPhaseDayEvent());
            expect(game.getField()).toEqual({
                rule,
                phase: PHASE_DAY,
                day: 1,
                votebox: {}
            });
        });

        it("EVENT_PHASE_NIGHT",()=>{
            game.runAllEvents(events.initPhaseNightEvent());
            expect(game.getField()).toEqual({
                rule,
                phase: PHASE_NIGHT,
                day: 0,
                votebox: {}
            });
        });
    });
    describe("Voting Events",()=>{
        it("initVoteEvent",()=>{
            expect(events.initVoteEvent({
                from: "id1",
                to: "id2",
                num: 2,
                priority: 0
            })).toEqual({
                type: events.EVENT_VOTE,
                from: "id1",
                to: "id2",
                num: 2,
                priority: 0
            });
        });
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
                type: events.EVENT_VOTE,
                from: "id1",
                to: "id2",
                num: 1,
                priority: 0
            } as events.VoteEvent);
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
        it("initJobEvent",()=>{
            expect(events.initJobEvent({
                from: "id1",
                to: "id2"
            })).toEqual({
                type: events.EVENT_JOB,
                from: "id1",
                to: "id2"
            });
        });
        it("EVENT_JOB",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: "TODO"
            }));
            game.addPlayer(initPlayer({
                id: "id2",
                type: "TODO"
            }));
            game.runAllEvents(events.initJobEvent({
                from: "id1",
                to: "id2"
            }));
            expect(game.getPlayers().get("id1").target).toBe("id2");
        });
        it("EVENT_JOB overrides target",()=>{
            game.addPlayer(initPlayer({
                id: "id1",
                type: "TODO"
            }));
            game.addPlayer(initPlayer({
                id: "id2",
                type: "TODO"
            }));
            game.runAllEvents(events.initJobEvent({
                from: "id1",
                to: "id2"
            }));
            game.runAllEvents(events.initJobEvent({
                from: "id1",
                to: "id1"
            }));
            expect(game.getPlayers().get("id1").target).toBe("id1");
        });
    });
    describe("Die Event",()=>{
        it("initDieEvent",()=>{
            expect(events.initDieEvent({
                on: "id1",
                reason: "foo"
            })).toEqual({
                type: events.EVENT_DIE,
                on: "id1",
                reason: "foo"
            });
        });
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
            game.runAllEvents(events.initDieEvent({
                on: "id1",
                reason: "foo"
            }));
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
            game.runAllEvents(events.initDieEvent({
                on: "id1",
                reason: "foo"
            }));
            game.runAllEvents(events.initDieEvent({
                on: "id1",
                reason: "bar"
            }));
            expect(game.getPlayers().get("id1").dead_reason).toBe("foo");
        });
    });
    describe("Lynch Events",()=>{
        it("initLynchEvent",()=>{
            expect(events.initLynchEvent()).toEqual({
                type: events.EVENT_LYNCH,
                voteResult: null
            });
        });
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
                const e = game.runAllEvents(events.initLynchEvent()) as events.LynchEvent;
                expect(e.voteResult).toBe(votebox.VOTERESULT_NONE);
            });
            it("Lynch result is CHOSEN",()=>{
                //votes
                game.runAllEvents(events.initVoteEvent({
                    from: "id1",
                    to: "id2",
                    num: 1,
                    priority: 0
                }));
                game.runAllEvents(events.initVoteEvent({
                    from: "id2",
                    to: "id1",
                    num: 1,
                    priority: 0
                }));
                game.runAllEvents(events.initVoteEvent({
                    from: "id3",
                    to: "id2",
                    num: 1,
                    priority: 0
                }));
                //lynch
                const e = game.runAllEvents(events.initLynchEvent()) as events.LynchEvent;
                expect(e.voteResult).toBe(votebox.VOTERESULT_CHOSEN);
                const p = game.getPlayers().get("id2");
                expect(p.dead).toBe(true);
                expect(p.dead_reason).toBe(diereason.LYNCH);
            });
        });
    });
});
