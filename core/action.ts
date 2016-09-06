// Event actions
import {EventActions, EventRunner} from '../lib';
import {Player} from './player';
import {
    Effect,
    ChoiceEffect,
    EFFECT_CHOICE,
    initChoiceEffect,
} from './effect';
import {Field, PHASE_DAY, PHASE_NIGHT} from './field';
import {
    initLogPhaseTransition,
} from './logs';

import {initVoteBox, addVote, countVotes, VOTERESULT_CHOSEN, VOTERESULT_MULTI, VOTERESULT_NONE} from './lib/votebox';

import * as events from './events';

import * as diereason from './lib/diereason';
import * as count from './lib/count';
import * as team from './lib/team';

export default ({
    // atomicなイベント
    [events.EVENT_OPENCHOICE]: ({effects, event})=>{
        const event2 = event as events.OpenChoiceEvent;
        // ChoiceEffectを作る
        const e = initChoiceEffect(event2.on, event2.kind, event2.options);
        effects.add(e);
    },
    [events.EVENT_CHOICE]: ({players, effects, event})=>{
        // 選択肢に対する回答
        const event2 = event as events.ChoiceEvent;
        const pl = players.get(event2.from);
        const ef = effects.get(event2.choice_id) as ChoiceEffect;
        if (pl != null && ef != null){
            // PlayerとEffectが存在した
            if (ef.type === EFFECT_CHOICE && ef.id === event2.choice_id && ef.on === pl.id){
                // 該当の選択肢を見つけた
                const v = event2.value;
                if (ef.options.some(({value})=> value === v)){
                    ef.value = v;
                    return;
                }
            }
        }
        // TODO: 該当の選択肢が無かったときの処理は？
        event2.prevented = true;
    },

    // phase transform
    [events.EVENT_PHASE_DAY]: ({field})=>{
        // phaseが移動する
        field.phase = PHASE_DAY;
        field.day++;
        // 投票を初期化する
        field.votebox = initVoteBox();
        // ログを出す
        field.logs.push(initLogPhaseTransition(field.day, 'day'));
    },
    [events.EVENT_PHASE_NIGHT]: ({players, field})=>{
        // 夜になる
        field.phase = PHASE_NIGHT;
        // 人狼の襲撃情報を初期化
        field.werewolfRemains = 1;
        field.werewolfTarget = [];
        // ログを出す
        field.logs.push(initLogPhaseTransition(field.day, 'night'));
    },
    [events.EVENT_MIDNIGHT]: ({runner, players, field})=>{
        // 真夜中の処理：人狼に襲われて死亡する
        for (let {to} of field.werewolfTarget){
            // fromさんがtoさんをころしちゃうぞ
            runner.addEvent(events.initDieEvent({
                on: to,
                reason: diereason.WEREWOLF,

            }));
        }
    },
    [events.EVENT_LYNCH]: ({runner, field, event})=>{
        // 処刑対象を決定する
        const {result, ids} = countVotes(field.votebox);
        (event as events.LynchEvent).voteResult = result;
        if (result===VOTERESULT_CHOSEN){
            // 処刑対象が決定した
            runner.addEvent(events.initDieEvent({
                on: ids[0],
                reason: diereason.LYNCH,
            }));
        }else if (result===VOTERESULT_MULTI){
            // 複数いた(TODO)
        }else if (result===VOTERESULT_NONE){
            // 処刑が成立しなかった(TODO)
        }
    },

    [events.EVENT_VOTE]: ({field, event})=>{
        const event2 = event as events.VoteEvent;
        // 投票する
        if (field.votebox == null){
            field.votebox = initVoteBox();
        }
        addVote(field.votebox, {
            from: event2.from,
            to: event2.to,
            num: event2.num,
            priority: event2.priority,
        });
    },
    [events.EVENT_DIE]: ({players, event})=>{
        const event2 = event as events.DieEvent;
        // プレイヤーが死亡
        const pl = players.get(event2.on);
        if (pl && pl.dead!==true){
            pl.dead = true;
            pl.dead_reason = event2.reason;
        }
    },
    [events.EVENT_JUDGE]: ({runner, players, event})=>{
        // 勝利判定を行う
        const event2 = event as events.JudgeEvent;
        let c_human = 0;
        let c_werewolf = 0;
        let c_alive = 0;
        // 死亡していない人をカウント
        for (let pl of players.asArray()){
            if (pl.dead===false){
                c_alive++;
                const {count: c} = runner.runEvent(events.initQueryCountEvent(pl.id));
                switch (c){
                    case count.COUNT_HUMAN:
                        c_human++;
                        break;
                    case count.COUNT_WEREWOLF:
                        c_werewolf++;
                        break;
                }
            }
        }
        // カウントに応じてあれする
        if (c_alive===0){
            // 全滅は引き分け
            event2.end = true;
            event2.draw = true;
        }else if (c_werewolf===0){
            // 人狼が全滅
            event2.end = true;
            event2.draw = false;
            event2.result = team.TEAM_HUMAN;
        }else if (c_human <= c_werewolf){
            // 村人が少ない
            event2.end = true;
            event2.draw = false;
            event2.result = team.TEAM_WEREWOLF;
        }else{
            // 終わらなかった
            event2.end = false;
        }
    },

    [events.EVENT_QUERY_VOTEDONE]: ({field, event})=>{
        const event2 = event as events.QueryVotedoneEvent;
        const box = field.votebox;
        if (box && (event2.on in box)){
            event2.result = true;
        }
    },
} as EventActions<Player, Effect, Field, EventRunner<Player, Effect, Field>>);

