//Seer Event
import {Event} from '../../lib';

import * as priority from '../priority';

//霊能結果
export const MEDIUM_RESULT_NONE  = "mediumresumt.none";
export const MEDIUM_RESULT_HUMAN = "mediumresult.human";
export const MEDIUM_RESULT_WEREWOLF = "mediumresult.werewolf";

//霊能イベント
export const EVENT_QUERY_MEDIUM = "core.medium.query.medium";
export interface QueryMediumEvent extends Event{
    //霊能者
    from: string;
    //霊能対象
    to: string;
    //霊能結果
    result: string;
}
export function initQueryMediumEvent(obj:{from:string; to:string;}):QueryMediumEvent{
    const {from, to}=obj;
    return {
        type: EVENT_QUERY_MEDIUM,
        from,
        to,
        result: MEDIUM_RESULT_HUMAN
    };
}

//霊能実行イベント
export const EVENT_DO_MEDIUM = "core.medium.domedium";
export interface DoMediumEvent extends Event{
    //誰が
    from: string;
    //誰を
    to: string;
}
export function initDoMediumEvent(obj:{
    from: string;
    to: string;
}):DoMediumEvent{
    const {from, to} = obj;
    return {
        type: EVENT_DO_MEDIUM,
        from,
        to
    };
}

//utility: 霊能結果を設定するeffect
export function mediumEffect(role:string, result:string){
    return [{
        priority: priority.QUERY_RESULT_INIT,
        handler: ({players, event})=>{
            const event2 = event as QueryMediumEvent;
            const pl = players.get(event2.to);
            if(pl && pl.type===role){
                event2.result = result;
            }
        }
    }];
}

