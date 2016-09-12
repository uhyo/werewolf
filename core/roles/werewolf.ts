// Werewolf: 人狼
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../event';
import * as effect from '../effect';
import * as priority from '../priority';
import * as count from '../lib/count';
import {
    Choice,
    alivePlayerOptions,
} from '../lib/choice';

import * as werewolfevent from './werewolf.event';
import * as seerevent from './seer.event';
import * as mediumevent from './medium.event';

export interface Werewolf extends Player{
}

const ROLE_WEREWOLF = 'core.werewolf';

export default {
    role: ROLE_WEREWOLF,
    playerProducers: {
        [ROLE_WEREWOLF]: {
            // 人狼は終了判定カウントが人狼
            [events.EVENT_QUERY_COUNT]: [{
                priority: priority.QUERY_RESULT_INIT,
                handler: ({players, event})=>{
                    const event2 = event as events.QueryCountEvent;
                    const pl = players.get(event2.on);
                    if (pl && pl.type===ROLE_WEREWOLF){
                        event2.count = count.COUNT_WEREWOLF;
                    }
                },
            }],
            // 夜になると襲撃対象選択が出現
            [events.EVENT_PHASE_NIGHT]: [{
                priority: priority.MIDNIGHT_STANDARD,
                handler: ({event, player, players, runner})=>{
                    runner.addEvent(events.initOpenChoiceEvent({
                        on: player.id,
                        kind: werewolfevent.CHOICE_WEREWOLF,
                        options: alivePlayerOptions(players),
                    }));
                },
            }],
            // 人狼の対象選択は特殊な処理が入る
            [events.EVENT_CHOICE]: [{
                priority: priority.CHOICE_REACTION,
                handler: ({event, players, effects, field, runner})=>{
                    const event2 = event as events.ChoiceEvent;
                    if (event2.prevented){
                        // 選択肢が正常に処理されたときだけ動作する
                        return;
                    }
                    // 該当選択肢を取得
                    const ef = effects.get(event2.choice_id) as effect.ChoiceEffect;
                    if (ef != null && ef.choice_kind === werewolfevent.CHOICE_WEREWOLF){
                        // 人狼の対象を選択しようとしたのであるぞ

                        // 狼の襲撃を処理してもらう
                        runner.addEvent(werewolfevent.initJobWerewolfEvent({
                            from: event2.from,
                            to: event2.value,
                        }));
                    }
                },
            }],
            [seerevent.EVENT_QUERY_SEER]: seerevent.seerEffect(ROLE_WEREWOLF, seerevent.SEER_RESULT_WEREWOLF),
            [mediumevent.EVENT_QUERY_MEDIUM]: mediumevent.mediumEffect(ROLE_WEREWOLF, mediumevent.MEDIUM_RESULT_WEREWOLF),
        },
    },
    actions: {
        // 人狼の対象選択を実行
        [werewolfevent.EVENT_JOB_WEREWOLF]: ({field, effects, event})=>{
            const {from, to} = event as werewolfevent.JobWerewolfEvent;
            if (field.werewolfRemains > 0){
                // 襲撃可能
                field.werewolfRemains--;
                field.werewolfTarget.push({
                    from,
                    to,
                });

                if (field.werewolfRemains <= 0){
                    // 選択肢を消去
                    const rmvs: Array<string> = [];
                    for (let e of effects.asArray()){
                        if (e.type === werewolfevent.CHOICE_WEREWOLF){
                            rmvs.push(e.id);
                        }
                    }
                    for (let id of rmvs){
                        effects.removeById(id);
                    }
                }else{
                    // 選択肢を最有効化
                    for (let e of effects.asArray()){
                        if (e.type === werewolfevent.CHOICE_WEREWOLF){
                            (e as effect.ChoiceEffect).value = undefined;
                        }
                    }
                }
            }
        },
    },
} as RolePackage<Werewolf>;

