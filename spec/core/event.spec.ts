import {initGame, makeRule, getPlayerInitiator} from './init-game';
import {Game, Effects} from '../../lib';
import {Player, PlayerInit, PlayerInitiator} from '../../core/player';
import {
    initField,
    Field, Rule,
    PHASE_DAY,
    PHASE_NIGHT,
} from '../../core/field';
import * as effect from '../../core/effect';
import * as log from '../../core/log';
import * as events from '../../core/event';
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
    // 特定のイベントが発生したか監視
    const eventMonitor = (game: Game<Player, Effect, Field>, ev: string, handler: ()=>void)=>{
        game.loadRuleProducers([{
            [ev]: [{
                priority: 1e6,
                handler,
            }],
        }]);
    };
    // fieldをむりやり書き換える
    const getModifiableField = (game: Game<Player, Effect, Field>)=> (game as any).field as Field;
    // playerもむりやり書き換える
    const getModifiablePlayer = (game: Game<Player, Effect, Field>, id: string)=> (game as any).players.get(id) as Player;
    const getModifiableEffects = (game: Game<Player, Effect, Field>)=> (game as any).effects as Effects<effect.Effect>;

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
    describe('Pull logs', ()=>{
        it('initPullLogsEvent', ()=>{
            expect(events.initPullLogsEvent()).toEqual({
                type: events.EVENT_PULL_LOGS,
                logs: [],
            });
        });
        it('EVENT_PULL_LOGS deletes remaining logs', ()=>{
            const f = getModifiableField(game);
            const l = log.initLogPhaseTransition(1, 'day');
            f.logs.push(l);
            game.runEvent(events.initPullLogsEvent());

            const f2 = game.getField();
            expect(f2.logs).toEqual([]);
        });
        it('EVENT_PULL_LOGS gets logs', ()=>{
            const f = getModifiableField(game);
            const l = log.initLogPhaseTransition(1, 'day');
            f.logs.push(l);
            const e = game.runEvent(events.initPullLogsEvent());

            expect(e.logs).toEqual([l]);
        });
    });
    describe('Phase Events', ()=>{
        it('initNextPhaseEvent', ()=>{
            expect(events.initNextPhaseEvent()).toEqual({
                type: events.EVENT_NEXTPHASE,
            });
        });
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
                    type: log.LOG_PHASE_TRANSITION,
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
                    type: log.LOG_PHASE_TRANSITION,
                    day: 0,
                    phase: 'night',
                },
            ]);
        });
        describe('EVENT_NEXTPHASE', ()=>{
            it('start -> night', ()=>{
                let flag = false;
                // add handler that catches emission of EVENT_PHASE_NIGHT
                eventMonitor(game, events.EVENT_PHASE_NIGHT, ()=>{
                    flag = true;
                });
                game.runEvent(events.initNextPhaseEvent());
                expect(flag).toBe(true);
            });
            it('night -> day', ()=>{
                const f = getModifiableField(game);
                f.phase = PHASE_NIGHT;
                f.day = 2;
                let flag = 0;
                eventMonitor(game, events.EVENT_PHASE_DAY, ()=>{
                    flag++;
                });
                eventMonitor(game, events.EVENT_MIDNIGHT, ()=>{
                    flag++;
                });
                game.runEvent(events.initNextPhaseEvent());
                expect(flag).toBe(2);
            });
            it('day -> night', ()=>{
                const f = getModifiableField(game);
                f.phase = PHASE_DAY;
                f.day = 2;
                let flag = 0;
                eventMonitor(game, events.EVENT_PHASE_NIGHT, ()=>{
                    flag++;
                });
                eventMonitor(game, events.EVENT_LYNCH, ()=>{
                    flag++;
                });
                game.runEvent(events.initNextPhaseEvent());
                expect(flag).toBe(2);
            });
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
    describe('PlayerInfo', ()=>{
        it('EVENT_QUERY_PLAYERINFO', ()=>{
            expect(events.initQueryPlayerInfoEvent('id1')).toEqual({
                type: events.EVENT_QUERY_PLAYERINFO,
                on: 'id1',
                result: {
                    id: 'id1',
                    roleDisp: undefined,
                    dead: undefined,
                    choices: [],
                    data: {},
                },
            });
        });
        it('Basic query result', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            const ev = game.runEvent(events.initQueryPlayerInfoEvent('id1'));
            const i = ev.result;
            expect(i.id).toBe('id1');
            expect(i.roleDisp).toBe('TODO');
            expect(i.dead).toBe(false);
            expect(i.choices).toEqual([]);
        });
        it('deadness', ()=>{
            game.addPlayer(initPlayer({
                id: 'id1',
                type: 'TODO',
            }));
            const pl = getModifiablePlayer(game, 'id1');
            pl.dead = true;

            const ev = game.runEvent(events.initQueryPlayerInfoEvent('id1'));
            const i = ev.result;
            expect(i.dead).toBe(true);
        });
        describe('open choices', ()=>{
            it('no choice', ()=>{
                game.addPlayer(initPlayer({
                    id: 'id1',
                    type: 'TODO',
                }));
                game.addEffect(effect.initChoiceEffect('id1', 'foooo', [{
                    value: 'id1',
                    label: 'id1',
                    label_kind: 'player',
                }, {
                    value: '吉野家',
                    label: '吉野家',
                    label_kind: 'string',
                }]));

                const {result} = game.runEvent(events.initQueryPlayerInfoEvent('id1'));
                expect(result.choices).toEqual([{
                    kind: 'foooo',
                    options: [{
                        value: 'id1',
                        label: 'id1',
                        label_kind: 'player',
                    }, {
                        value: '吉野家',
                        label: '吉野家',
                        label_kind: 'string',
                    }],
                    value: undefined,
                }]);
            });
            it('yes choice', ()=>{
                game.addPlayer(initPlayer({
                    id: 'id1',
                    type: 'TODO',
                }));
                game.addEffect(effect.initChoiceEffect('id1', 'foooo', [{
                    value: 'id1',
                    label: 'id1',
                    label_kind: 'player',
                }, {
                    value: '吉野家',
                    label: '吉野家',
                    label_kind: 'string',
                }]));
                // 選択肢を書き換え
                getModifiableEffects(game).ofType<effect.ChoiceEffect>(effect.EFFECT_CHOICE)[0].value = 'id1';

                const {result} = game.runEvent(events.initQueryPlayerInfoEvent('id1'));
                expect(result.choices).toEqual([{
                    kind: 'foooo',
                    options: [{
                        value: 'id1',
                        label: 'id1',
                        label_kind: 'player',
                    }, {
                        value: '吉野家',
                        label: '吉野家',
                        label_kind: 'string',
                    }],
                    value: 'id1',
                }]);
            });
        });
    });
});
