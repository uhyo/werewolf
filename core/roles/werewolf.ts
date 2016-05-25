//Werewolf: 人狼
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';

import * as werewolfevent from './werewolf.event';
import * as seerevent from './seer.event';
import * as mediumevent from './medium.event';

export interface Werewolf extends Player{
}

const ROLE_WEREWOLF = "core.werewolf";

export default {
    role: ROLE_WEREWOLF,
    playerProducers: {
        [ROLE_WEREWOLF]: {
            // 人狼は終了判定カウントが人狼
            [events.EVENT_QUERY_COUNT]: [{
                priority: priority.QUERY_RESULT_INIT,
                handler: ({players,event})=>{
                    const event2 = event as events.QueryCountEvent;
                    const pl = players.get(event2.on);
                    if(pl && pl.type===ROLE_WEREWOLF){
                        event2.count = count.COUNT_WEREWOLF;
                    }
                }
            }],
            // 人狼の対象選択は特殊な処理が入る
            [events.EVENT_JOB]: [{
                priority: priority.JOB_OVERRIDE,
                handler: ({event, players, field, runner})=>{
                    const event2 = event as events.JobEvent;
                    const pl = players.get(event2.from);
                    if(pl && pl.type===ROLE_WEREWOLF){
                        // 狼による襲撃だった
                        // デフォルトアクションを無効化
                        event2.prevented = true;
                        // 狼の襲撃を処理
                        runner.addEvent(werewolfevent.initJobWerewolfEvent({
                            from: event2.from,
                            to: event2.to,
                        }));
                    }
                },
            }],
            [seerevent.EVENT_QUERY_SEER]: seerevent.seerEffect(ROLE_WEREWOLF, seerevent.SEER_RESULT_WEREWOLF),
            [mediumevent.EVENT_QUERY_MEDIUM]: mediumevent.mediumEffect(ROLE_WEREWOLF, mediumevent.MEDIUM_RESULT_WEREWOLF)
        }
    },
    actions: {
        // 人狼の対象選択を実行
        [werewolfevent.EVENT_JOB_WEREWOLF]:({field, event})=>{
            const {from, to} = event as werewolfevent.JobWerewolfEvent;
            if (field.werewolfRemains > 0){
                // 襲撃可能
                field.werewolfRemains--;
                field.werewolfTarget.push({
                    from,
                    to,
                });
            }
        },
    },
} as RolePackage<Werewolf>;

