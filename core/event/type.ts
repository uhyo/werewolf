import {Event} from '../../lib';

//処刑をするイベント
export interface LynchEvent extends Event{
    //投票結果がどうなったか
    voteResult: string;
}

//死亡するイベント
export interface DieEvent extends Event{
    //誰が死亡するか
    on:string;
    //死因
    reason:string;
}
