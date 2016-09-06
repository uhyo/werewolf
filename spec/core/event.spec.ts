///<reference path='../../typings/bundle.d.ts' />

import {initGame, makeRule, getPlayerInitiator} from './init-game';
import {Game} from '../../lib';
import {Player, PlayerInit, PlayerInitiator} from '../../core/player';
import {
    initField,
    Field, Rule,
    PHASE_DAY, PHASE_NIGHT,
} from '../../core/field';
import * as effect from '../../core/effect';
import * as logs from '../../core/logs';
import * as events from '../../core/events';
import * as votebox from '../../core/lib/votebox';
import * as count from '../../core/lib/count';
import * as diereason from '../../core/lib/diereason';
import * as team from '../../core/lib/team';

type Effect = effect.Effect;

describe('Events', ()=>{
    let game: Game<Player, Effect, Field>;
    let pi: PlayerInitiator;
    let rule: Rule = makeRule();
    // macro
    const initPlayer = (obj: PlayerInit)=> pi.initPlayer(obj);
    beforeEach(()=>{
        game = initGame(initField(rule));
        pi = getPlayerInitiator();
    });
    describe('Choice Events', ()=>{
        it('EVENT_OPENCHOICE', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.runEvent(events.initOpenChoiceEvent({
                on: 'id1',
                kind: 'foooo',
                options: [{
                    label: 'あいう',
                    label_kind: 'string',
                    value: 'aiu',
                }, {
                    label: '吉野家',
                    label_kind: 'string',
                    value: 'yoshinoya',
                }],
            }));
            const efs = game.getEffects();
            expect(efs.length).toBe(1);
            const e = efs.get(0) as effect.ChoiceEffect;
            expect(e.type).toBe(effect.EFFECT_CHOICE);
            expect('string' === typeof e.id).toBe(true);
            expect(e.choice_kind).toBe('foooo');
            expect(e.options).toEqual([{
                label: 'あいう',
                label_kind: 'string',
                value: 'aiu',
            }, {
                label: '吉野家',
                label_kind: 'string',
                value: 'yoshinoya',
            }]);
            expect(e.value).toBe(undefined);
        });
        it('EVENT_CHOICE', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id2',
                type: 'TODO',
            }));
            const ef = effect.initChoiceEffect('id1', 'foo.kind', [{
                label: 'あいう',
                label_kind: 'string',
                value: 'aiu',
            }, {
                label: '吉野家',
                label_kind: 'string',
                value: 'yoshinoya',
            }]);
            game.addEffect(ef);
            const efid = ef.id;
            game.runEvent(events.initChoiceEvent({
                from: 'id1',
                choice_id: efid,
                value: 'yoshinoya',
            }));
            expect(game.getEffects().get<effect.ChoiceEffect>(efid)!.value).toBe('yoshinoya');
        });
    });
    describe('Phase Events', ()=>{
        it('initPhaseDayEvent', ()=>{
            expect(events.initPhaseDayEvent()).toEqual({
                type: events.EVENT_PHASE_DAY,
            });
        });
        it('initPhaseNightEvent', ()=>{
            expect(events.initPhaseNightEvent()).toEqual({
                type: events.EVENT_PHASE_NIGHT,
            });
        });
        it('EVENT_PHASE_DAY', ()=>{
            game.runEvent(events.initPhaseDayEvent());
            const f = game.getField();
            expect(f.phase).toBe(PHASE_DAY);
            expect(f.day).toBe(1);
            expect(f.votebox).toEqual({});
            expect(f.logs).toEqual([
                {
                    type: logs.LOG_PHASE_TRANSITION,
                    day: 1,
                    phase: 'day',
                },
            ]);
        });

        it('EVENT_PHASE_NIGHT', ()=>{
            game.runEvent(events.initPhaseNightEvent());
            const f = game.getField();
            expect(f.phase).toBe(PHASE_NIGHT);
            expect(f.day).toBe(0);
            expect(f.werewolfRemains).toBe(1);
            expect(f.werewolfTarget).toEqual([]);
            expect(f.logs).toEqual([
                {
                    type: logs.LOG_PHASE_TRANSITION,
                    day: 0,
                    phase: 'night',
                },
            ]);
        });
    });
    describe('Voting Events', ()=>{
        it('initVoteEvent', ()=>{
            expect(events.initVoteEvent({
                from: 'id1',
                to: 'id2',
                num: 2,
                priority: 0,
            })).toEqual({
                type: events.EVENT_VOTE,
                from: 'id1',
                to: 'id2',
                num: 2,
                priority: 0,
            });
        });
        it('EVENT_VOTE', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id2',
                type: 'TODO',
            }));
            game.runEvent(events.initVoteEvent({
                from: 'id1',
                to: 'id2',
                num: 1,
                priority: 0,
            }));
            const v = game.getField().votebox;
            expect(v).toEqual({
                id1: {
                    from: 'id1',
                    to: 'id2',
                    num: 1,
                    priority: 0,
                },
            });
        });
        it('initChoiceEvent', ()=>{
            expect(events.initChoiceEvent({
                from: 'id1',
                choice_id: 'foooo',
                value: 'id2',
            })).toEqual({
                type: events.EVENT_CHOICE,
                choice_id: 'foooo',
                from: 'id1',
                value: 'id2',
            });
        });
    });
    describe('Die Event', ()=>{
        it('initDieEvent', ()=>{
            expect(events.initDieEvent({
                on: 'id1',
                reason: 'foo',
            })).toEqual({
                type: events.EVENT_DIE,
                on: 'id1',
                reason: 'foo',
            });
        });
        it('EVENT_DIE', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id2',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id3',
                type: 'TODO',
            }));
            game.runEvent(events.initDieEvent({
                on: 'id1',
                reason: 'foo',
            }));
            expect(game.getPlayers().get('id1')!.dead).toBe(true);
            expect(game.getPlayers().get('id1')!.dead_reason).toBe('foo');
            expect(game.getPlayers().get('id2')!.dead).toBe(false);
            expect(game.getPlayers().get('id3')!.dead).toBe(false);
        });
        it("EVENT_DIE don't override reason", ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.runEvent(events.initDieEvent({
                on: 'id1',
                reason: 'foo',
            }));
            game.runEvent(events.initDieEvent({
                on: 'id1',
                reason: 'bar',
            }));
            expect(game.getPlayers().get('id1')!.dead_reason).toBe('foo');
        });
    });
    describe('Lynch Events', ()=>{
        it('initLynchEvent', ()=>{
            expect(events.initLynchEvent()).toEqual({
                type: events.EVENT_LYNCH,
                voteResult: undefined,
            });
        });
        describe('EVENT_LYNCH', ()=>{
            beforeEach(()=>{
                game.addPlayer(initPlayer({
                    id: 'id1',
                    type: 'TODO',
                }));
                game.addPlayer(initPlayer({
                    id: 'id2',
                    type: 'TODO',
                }));
                game.addPlayer(initPlayer({
                    id: 'id3',
                    type: 'TODO',
                }));
            });
            it('Lynch result is NONE', ()=>{
                const e = game.runEvent(events.initLynchEvent());
                expect(e.voteResult).toBe(votebox.VOTERESULT_NONE);
            });
            it('Lynch result is CHOSEN', ()=>{
                // votes
                game.runEvent(events.initVoteEvent({
                    from: 'id1',
                    to: 'id2',
                    num: 1,
                    priority: 0,
                }));
                game.runEvent(events.initVoteEvent({
                    from: 'id2',
                    to: 'id1',
                    num: 1,
                    priority: 0,
                }));
                game.runEvent(events.initVoteEvent({
                    from: 'id3',
                    to: 'id2',
                    num: 1,
                    priority: 0,
                }));
                // lynch
                const e = game.runEvent(events.initLynchEvent());
                expect(e.voteResult).toBe(votebox.VOTERESULT_CHOSEN);
                const p = game.getPlayers().get('id2');
                expect(p!.dead).toBe(true);
                expect(p!.dead_reason).toBe(diereason.LYNCH);
            });
        });
    });
    describe('Judge Event', ()=>{
        beforeEach(()=>{
            // 仮想役職の導入
            game.loadPlayerProducers({
                // 人狼
                'Role1': {
                    [events.EVENT_QUERY_COUNT]: [{
                        priority: 1,
                        handler: ({players, event: ev})=>{
                            const ev2 = ev as events.QueryCountEvent;
                            const pl = players.get(ev2.on);
                            if (pl && pl.type==='Role1'){
                                ev2.count = count.COUNT_WEREWOLF;
                            }
                        },
                    }],
                },
            });
            // プレイヤーの導入
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id2',
                type: 'TODO',
            }));
            game.addPlayer(initPlayer({
                id: 'id3',
                type: 'Role1',
            }));
        });
        it('JudgeEvent defaults to non-end', ()=>{
            expect(events.initJudgeEvent()).toEqual({
                type: events.EVENT_JUDGE,
                end: false,
                draw: false,
                result: undefined,
            });
        });
        it('no end', ()=>{
            const e = game.runEvent(events.initJudgeEvent());
            expect(e.end).toBe(false);
        });
        it('Human wins', ()=>{
            game.runEvent(events.initDieEvent({
                on: 'id3',
                reason: 'TODO',
            }));
            const e = game.runEvent(events.initJudgeEvent());
            expect(e.end).toBe(true);
            expect(e.draw).toBe(false);
            expect(e.result).toBe(team.TEAM_HUMAN);
        });
        it('Werewolf wins', ()=>{
            game.runEvent(events.initDieEvent({
                on: 'id1',
                reason: 'TODO',
            }));
            const e = game.runEvent(events.initJudgeEvent());
            expect(e.end).toBe(true);
            expect(e.draw).toBe(false);
            expect(e.result).toBe(team.TEAM_WEREWOLF);
        });
    });
    describe('Query Events', ()=>{
        it('EVENT_QUERY_COUNT defaults to human', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            const e = game.runEvent(events.initQueryCountEvent('id1'));
            expect(e.count).toBe(count.COUNT_HUMAN);
        });
        describe('EVENT_QUERY_VOTEDONE', ()=>{
            beforeEach(()=>{
                game.addPlayer(initPlayer({
                    id: 'id1',
                    type: 'TODO',
                }));
                game.addPlayer(initPlayer({
                    id: 'id2',
                    type: 'TODO',
                }));
                game.runEvent(events.initPhaseDayEvent());
            });
            it('result defaults to false', ()=>{
                expect(events.initQueryVotedoneEvent('id1').result).toBe(false);
            });
            it('results false if not voted', ()=>{
                const e = game.runEvent(events.initQueryVotedoneEvent('id1'));
                expect(e.result).toBe(false);
            });
            it('result true if voted', ()=>{
                game.runEvent(events.initVoteEvent({
                    from: 'id1',
                    to: 'id2',
                    num: 1,
                    priority: 0,
                }));
                const e = game.runEvent(events.initQueryVotedoneEvent('id1'));
                expect(e.result).toBe(true);
            });
        });
    });
});
