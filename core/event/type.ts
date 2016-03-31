import {Event} from '../../lib';

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

//処刑をするイベント
export interface LynchEvent extends Event{
    //投票結果がどうなったか
    voteResult?: string;
}

//死亡するイベント
export interface DieEvent extends Event{
    //誰が死亡するか
    on:string;
    //死因
    reason:string;
}
