//Event definitions
import {Event} from '../lib';

//昼になるevent
export const EVENT_PHASE_DAY = "core.phase.day";
//夜になるevent
export const EVENT_PHASE_NIGHT = "core.phase.night";
//夜の処理を実行するevent
export const EVENT_MIDNIGHT = "core.midnight";

//処刑を実行するevent
export const EVENT_LYNCH = "core.lynch";

//処刑投票
export const EVENT_VOTE = "core.vote";

//夜の投票
export const EVENT_JOB = "core.job";

//死亡
export const EVENT_DIE = "core.die";

//Phase event
export function initPhaseDayEvent():Event{
    return {
        type: EVENT_PHASE_DAY
    };
}
export function initPhaseNightEvent():Event{
    return {
        type: EVENT_PHASE_NIGHT
    };
}

//投票するイベント
export interface VoteEvent extends Event{
    //投票者
    from: string;
    //投票先
    to: string;
    //票数
    num: number;
    //優先度
    priority: number;
}
export function initVoteEvent(obj:{
    from: string;
    to: string;
    num: number;
    priority: number;
}):VoteEvent{
    const {from, to, num, priority} = obj;
    return {
        type: EVENT_VOTE,
        from,
        to,
        num,
        priority
    };
}

//処刑をするイベント
export interface LynchEvent extends Event{
    //投票結果がどうなったか
    voteResult?: string;
}
export function initLynchEvent():LynchEvent{
    return {
        type: EVENT_LYNCH,
        voteResult: null
    };
}

//夜投票のイベント
export interface JobEvent extends Event{
    //投票者
    from: string;
    //対象
    to: string;
}
export function initJobEvent(obj:{
    from: string;
    to: string;
}):JobEvent{
    const {from, to} = obj;
    return {
        type: EVENT_JOB,
        from,
        to
    };
}


//死亡するイベント
export interface DieEvent extends Event{
    //誰が死亡するか
    on: string;
    //死因
    reason: string;
}
export function initDieEvent(obj:{
    on: string;
    reason: string;
}):DieEvent{
    const {on, reason} = obj;
    return {
        type: EVENT_DIE,
        on,
        reason
    };
}
