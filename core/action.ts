//Event actions
import {Event, EventActions, EventAdder, Players} from '../lib';
import {Player} from './player';
import {Effect} from './effect';
import {Field, PHASE_DAY, PHASE_NIGHT} from './field';

import {VoteBox, initVoteBox, addVote, countVotes, VOTERESULT_CHOSEN, VOTERESULT_MULTI, VOTERESULT_NONE} from './lib/votebox';

import * as events from './events';

import * as diereason from './lib/diereason';

export default ({
    [events.EVENT_PHASE_DAY]: ({field})=>{
        //phaseが移動する
        field.phase = PHASE_DAY;
        field.day++;
        //投票を初期化する
        field.votebox = initVoteBox();
    },
    [events.EVENT_PHASE_NIGHT]: ({field})=>{
        field.phase = PHASE_NIGHT;
    },
    [events.EVENT_MIDNIGHT]: ({})=>{
    },
    [events.EVENT_LYNCH]: ({adder, field, event})=>{
        //処刑対象を決定する
        const {result, ids} = countVotes(field.votebox);
        (event as events.LynchEvent).voteResult = result;
        if(result===VOTERESULT_CHOSEN){
            //処刑対象が決定した
            adder.addEvent<events.DieEvent>({
                type: events.EVENT_DIE,
                on: ids[0],
                reason: diereason.LYNCH
            });
        }else if(result===VOTERESULT_MULTI){
            //複数いた(TODO)
        }else if(result===VOTERESULT_NONE){
            //処刑が成立しなかった(TODO)
        }
    },

    [events.EVENT_JOB]:({players, event})=>{
        //夜の対象を決定した
        const event2 = event as events.JobEvent;
        const pl = players.get(event2.from);
        if(pl != null){
            //Playerが存在した
            pl.target = event2.to;
        }
    },

    [events.EVENT_VOTE]:({field, event})=>{
        const event2 = event as events.VoteEvent;
        //投票する
        if(field.votebox == null){
            field.votebox = initVoteBox();
        }
        addVote(field.votebox, {
            from: event2.from,
            to: event2.to,
            num: event2.num,
            priority: event2.priority
        });
    },
    [events.EVENT_DIE]:({players, event})=>{
        const event2 = event as events.DieEvent;
        //プレイヤーが死亡
        const pl = players.get(event2.on);
        if(pl && pl.dead!==true){
            pl.dead = true;
            pl.dead_reason = event2.reason;
        }
    },
} as EventActions<Player,Effect,Field>);

