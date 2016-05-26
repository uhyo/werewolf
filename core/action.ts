// Event actions
import {Event, EventActions, EventRunner, Players} from '../lib';
import {Player} from './player';
import {Effect} from './effect';
import {Field, PHASE_DAY, PHASE_NIGHT} from './field';

import {VoteBox, initVoteBox, addVote, countVotes, VOTERESULT_CHOSEN, VOTERESULT_MULTI, VOTERESULT_NONE} from './lib/votebox';

import * as events from './events';

import * as diereason from './lib/diereason';
import * as count from './lib/count';
import * as team from './lib/team';

export default ({
    [events.EVENT_PHASE_DAY]: ({field})=>{
        // phaseが移動する
        field.phase = PHASE_DAY;
        field.day++;
        // 投票を初期化する
        field.votebox = initVoteBox();
    },
    [events.EVENT_PHASE_NIGHT]: ({players, field})=>{
        // 夜になる
        field.phase = PHASE_NIGHT;
        // 夜投票を全部初期化する
        for (let p of players.asArray()){
            p.target = null;
        }
        // 人狼の襲撃情報を初期化
        field.werewolfRemains = 1;
        field.werewolfTarget = [];
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

    [events.EVENT_JOB]: ({players, event})=>{
        // 夜の対象を決定した
        const event2 = event as events.JobEvent;
        const pl = players.get(event2.from);
        if (pl != null){
            // Playerが存在した
            pl.target = event2.to;
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

