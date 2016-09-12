// Seer: 占い師
import {Player} from '../player';
import {
    initPackage,
    RolePackage,
} from '../package';

import * as effect from '../effect';
import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';
import {
    alivePlayerOptions,
} from '../lib/choice';

import * as seerevent from './seer.event';

export interface Seer extends Player{
    results: Array<{to: string; result: string}>;
    shown: number;
}

const ROLE_SEER = 'core.seer';

export default initPackage<Seer>({
    role: ROLE_SEER,
    roleInit(pl){
        pl.results = [];
        pl.shown = -1;
        return pl;
    },
    playerProducers: {
        [ROLE_SEER]: {
            [events.EVENT_PHASE_NIGHT]: [{
                // 占い対象の選択肢を出現させる
                priority: priority.MIDNIGHT_STANDARD,
                handler: ({event, player, players, runner})=>{
                    runner.addEvent(events.initOpenChoiceEvent({
                        on: player.id,
                        kind: seerevent.CHOICE_SEER,
                        options: alivePlayerOptions(players),
                    }));
                },
            }],
            [events.EVENT_MIDNIGHT]: [{
                priority: priority.MIDNIGHT_STANDARD,
                handler: ({runner, player, players, effects, event})=>{
                    // 夜の役職実行

                    // 占いの選択を見る
                    const cs = effects.ofType<effect.ChoiceEffect>(effect.EFFECT_CHOICE);
                    for (let {choice_kind, on, value} of cs){
                        if (choice_kind === seerevent.CHOICE_SEER && on === player.id && value != null){
                            const target = players.get(value);
                            if (target != null){
                                // 占い対象が存在
                                runner.addEvent(seerevent.initGetfortuneEvent({
                                    from: player.id,
                                    to: value,
                                }));
                            }
                        }
                    }
                },
            }],
        },
    },
    actions: {
        [seerevent.EVENT_GETFORTUNE]: ({runner, players, event})=>{
            const event2 = event as seerevent.GetfortuneEvent;
            // 占い者
            const seer = players.get<Seer>(event2.from);
            if (seer){
                // 占い結果を得る
                const e = runner.runEvent(seerevent.initQuerySeerEvent({
                    from: event2.from,
                    to: event2.to,
                }));
                seer.results.push({
                    to: e.to,
                    result: e.result,
                });
            }
        },
    },
});
