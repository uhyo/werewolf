import {initGame, makeRule, getPlayerInitiator} from './init-game';
import {Game} from '../../lib';
import {Player, PlayerInit, PlayerInitiator} from '../../core/player';
import {RolePackage} from '../../core/package';
import {
    initField,
    Field, Rule,
    PHASE_DAY, PHASE_NIGHT,
} from '../../core/field';
import * as effect from '../../core/effect';
type Effect = effect.Effect;
import * as events from '../../core/event';
import * as votebox from '../../core/lib/votebox';
import * as count from '../../core/lib/count';
import * as diereason from '../../core/lib/diereason';

import roleVillager from '../../core/roles/villager';
import roleWerewolf from '../../core/roles/werewolf';
import roleSeer, {Seer} from '../../core/roles/seer';
import roleMedium, {Medium} from '../../core/roles/medium';
import * as werewolfevent from '../../core/roles/werewolf.event';
import * as seerevent from '../../core/roles/seer.event';
import * as mediumevent from '../../core/roles/medium.event';

describe('Roles', ()=>{
    let game: Game<Player, Effect, Field>;
    let pi: PlayerInitiator;
    let rule: Rule = makeRule();
    const initPlayer = (obj: PlayerInit) => pi.initPlayer(obj);
    beforeEach(()=>{
        const load = (...ps: Array<RolePackage<Player>>)=>{
            for (let p of ps) {
                game.loadPackage(p);
                pi.add(p);
            }
        };
        game = initGame(initField(rule));
        pi = getPlayerInitiator();
        load(roleWerewolf, roleSeer, roleMedium);
    });
    describe('Werewolf', ()=>{
        it('Werewolf counts as werewolf', ()=>{
            game.addPlayer(pi.initPlayer({
                id: 'id1',
                type: roleWerewolf.role,
            }));
            const e = game.runEvent(events.initQueryCountEvent('id1'));
            expect(e.count).toBe(count.COUNT_WEREWOLF);
        });
        describe('Job Selection', ()=>{
            it('EVENT_PHASE_NIGHT initializes wolf choice', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleWerewolf.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleVillager.role,
                }));
                // 夜にする
                game.runEvent(events.initPhaseNightEvent());

                const efs = game.getEffects();
                expect(efs.length).toBe(1);
                const e = efs.get(0) as effect.ChoiceEffect;
                expect(e.type).toBe(effect.EFFECT_CHOICE);
                expect(e.on).toBe('id1');
                expect(e.choice_kind).toBe(werewolfevent.CHOICE_WEREWOLF);
                expect(e.value).toBe(undefined);
                expect(e.options).toEqual([{
                    label: 'id1',
                    label_kind: 'player',
                    value: 'id1',
                }, {
                    label: 'id2',
                    label_kind: 'player',
                    value: 'id2',
                }]);

            });
            it('EVENT_JOB_WEREWOLF sets wolf target', ()=>{
                // 夜にする
                game.runEvent(events.initPhaseNightEvent());
                game.runEvent(werewolfevent.initJobWerewolfEvent({
                    from: 'id1',
                    to: 'id2',
                }));
                // 選択済みになる
                const f = game.getField();
                expect(f.werewolfRemains).toBe(0);
                expect(f.werewolfTarget).toEqual([{
                    from: 'id1',
                    to: 'id2',
                }]);
            });
            it('decreases werewolf remains', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleWerewolf.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleVillager.role,
                }));
                // 夜にする
                game.runEvent(events.initPhaseNightEvent());

                // 選択
                expect(game.getField().werewolfRemains).toBe(1);
                game.runEvent(werewolfevent.initJobWerewolfEvent({
                    from: 'id1',
                    to: 'id2',
                }));
                // 選択済みになる
                const f = game.getField();
                expect(f.werewolfRemains).toBe(0);
                expect(f.werewolfTarget).toEqual([{
                    from: 'id1',
                    to: 'id2',
                }]);
            });
            it('job of werewolf', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleWerewolf.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleVillager.role,
                }));
                // 夜にする
                game.runEvent(events.initPhaseNightEvent());
                // 狼のchoice
                const e = game.getEffects().ofType(effect.EFFECT_CHOICE)[0] as effect.ChoiceEffect;
                // このchoiceを発動する
                game.runEvent(events.initChoiceEvent({
                    from: 'id1',
                    choice_id: e.id,
                    value: 'id2',
                }));
                // 人狼の対象が選択された
                const f = game.getField();
                expect(f.werewolfRemains).toBe(0);
                expect(f.werewolfTarget).toEqual([{
                    from: 'id1',
                    to: 'id2',
                }]);
            });
            it('Werewolf kill players', ()=>{
                // プレイヤーを導入
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleWerewolf.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleVillager.role,
                }));
                // 夜にする
                game.runEvent(events.initPhaseNightEvent());

                // 狼が対象選択
                expect(game.getField().werewolfRemains).toBe(1);
                const e = game.getEffects().ofType(effect.EFFECT_CHOICE)[0] as effect.ChoiceEffect;
                // このchoiceを発動する
                game.runEvent(events.initChoiceEvent({
                    from: 'id1',
                    choice_id: e.id,
                    value: 'id2',
                }));

                // 夜
                game.runEvent(events.initMidnightEvent());

                // 死んでる！！！！！！！！！！
                const pl = game.getPlayers().get('id2');
                expect(pl!.dead).toBe(true);
                expect(pl!.dead_reason).toBe(diereason.WEREWOLF);
            });
        });
    });
    describe('Seer', ()=>{
        it('init with result, shown set', ()=>{
            const pl = pi.initPlayer({
                id: 'id1',
                type: roleSeer.role,
            }) as Seer;
            expect(pl.results).toEqual([]);
            expect(pl.shown).toBe(-1);
        });
        describe('EVENT_QUERY_SEER', ()=>{
            it('init with SEER_RESULT_HUMAN', ()=>{
                expect(seerevent.initQuerySeerEvent({
                    from: 'id1',
                    to: 'id2',
                })).toEqual({
                    type: seerevent.EVENT_QUERY_SEER,
                    from: 'id1',
                    to: 'id2',
                    result: seerevent.SEER_RESULT_HUMAN,
                });
            });
            it('Werewolf seen with result of SEER_RESULT_WEREWOLF', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleSeer.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleWerewolf.role,
                }));
                const e = game.runEvent(seerevent.initQuerySeerEvent({
                    from: 'id1',
                    to: 'id2',
                }));
                expect(e.result).toBe(seerevent.SEER_RESULT_WEREWOLF);
            });
        });
        it('EVENT_GETFORTUNE', ()=>{
            game.addPlayer(pi.initPlayer({
                id: 'id1',
                type: roleSeer.role,
            }));
            game.addPlayer(pi.initPlayer({
                id: 'id2',
                type: roleWerewolf.role,
            }));
            const e = game.runEvent(seerevent.initGetfortuneEvent({
                from: 'id1',
                to: 'id2',
            }));
            expect(e.from).toBe('id1');
            expect(e.to).toBe('id2');
            const pl = game.getPlayers().get<Seer>('id1');
            expect(pl!.results).toEqual([{
                to: 'id2',
                result: seerevent.SEER_RESULT_WEREWOLF,
            }]);
            expect(pl!.shown).toBe(-1);
        });
        describe('job selection', ()=>{
            it('open choice at night', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleSeer.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleVillager.role,
                }));
                // 夜になる
                game.runEvent(events.initPhaseNightEvent());
                const efs = game.getEffects().asArray();
                expect(efs.length).toBe(1);
                const e = efs[0] as effect.ChoiceEffect;
                expect(e.type).toBe(effect.EFFECT_CHOICE);
                expect(e.on).toBe('id1');
                expect(e.choice_kind).toBe(seerevent.CHOICE_SEER);
                expect(e.value).toBe(undefined);
                expect(e.options).toEqual([{
                    label: 'id1',
                    label_kind: 'player',
                    value: 'id1',
                }, {
                    label: 'id2',
                    label_kind: 'player',
                    value: 'id2',
                }]);
            });
            it('get fortune result', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleSeer.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleWerewolf.role,
                }));
                // 夜になる
                game.runEvent(events.initPhaseNightEvent());

                const e = game.getEffects().get(0) as effect.ChoiceEffect;
                // 対象選択
                game.runEvent(events.initChoiceEvent({
                    from: 'id1',
                    choice_id: e.id,
                    value: 'id2',
                }));
                // 夜の能力実行
                game.runEvent(events.initMidnightEvent());

                // 実行結果を見る
                const pl = game.getPlayers().get<Seer>('id1');
                expect(pl!.results).toEqual([{
                    to: 'id2',
                    result: seerevent.SEER_RESULT_WEREWOLF,
                }]);
                expect(pl!.shown).toBe(-1);
            });
        });
    });
    describe('Medium', ()=>{
        it('init with result, shown set', ()=>{
            const pl = pi.initPlayer<Medium>({
                id: 'id1',
                type: roleMedium.role,
            });
            expect(pl.results).toEqual([]);
            expect(pl.shown).toBe(-1);
        });
        describe('EVENT_QUERY_MEDIUM', ()=>{
            it('init with MEDIUM_RESULT_HUMAN', ()=>{
                expect(mediumevent.initQueryMediumEvent({
                    from: 'id1',
                    to: 'id2',
                })).toEqual({
                    type: mediumevent.EVENT_QUERY_MEDIUM,
                    from: 'id1',
                    to: 'id2',
                    result: mediumevent.MEDIUM_RESULT_HUMAN,
                });
            });
            it('Werewolf mediumed with result of MEDIUM_RESULT_WEREWOLF', ()=>{
                game.addPlayer(pi.initPlayer({
                    id: 'id1',
                    type: roleMedium.role,
                }));
                game.addPlayer(pi.initPlayer({
                    id: 'id2',
                    type: roleWerewolf.role,
                }));
                const e = game.runEvent(mediumevent.initQueryMediumEvent({
                    from: 'id1',
                    to: 'id2',
                }));
                expect(e.result).toBe(mediumevent.MEDIUM_RESULT_WEREWOLF);
            });
        });
        it('EVENT_DO_MEDIUM', ()=>{
            game.addPlayer(pi.initPlayer({
                id: 'id1',
                type: roleMedium.role,
            }));
            game.addPlayer(pi.initPlayer({
                id: 'id2',
                type: roleWerewolf.role,
            }));
            game.runEvent(mediumevent.initDoMediumEvent({from: 'id1', to: 'id2'}));
            const pl = game.getPlayers().get<Medium>('id1');
            expect(pl!.results).toEqual([{
                to: 'id2',
                result: mediumevent.MEDIUM_RESULT_WEREWOLF,
            }]);
            expect(pl!.shown).toBe(-1);
        });
        it('hook for punish dying', ()=>{
            game.addPlayer(pi.initPlayer({
                id: 'id1',
                type: roleMedium.role,
            }));
            game.addPlayer(pi.initPlayer({
                id: 'id2',
                type: roleWerewolf.role,
            }));
            game.runEvent(events.initDieEvent({
                on: 'id2',
                reason: diereason.LYNCH,
            }));
            // 処刑したら霊能結果が入る
            const pl = game.getPlayers().get<Medium>('id1');
            expect(pl!.results).toEqual([{
                to: 'id2',
                result: mediumevent.MEDIUM_RESULT_WEREWOLF,
            }]);
        });
    });
});
