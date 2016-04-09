//Seer Event
import {Event} from '../../lib';

import * as priority from '../priority';

//占い結果
export const SEER_RESULT_NONE  = "none";
export const SEER_RESULT_HUMAN = "human";
export const SEER_RESULT_WEREWOLF = "werewolf";

//占いイベント
export const EVENT_QUERY_SEER = "core.seer.query.seer";
export interface QuerySeerEvent extends Event{
    //占い者
    from: string;
    //占い対象
    to: string;
    //占い結果
    result: string;
}
export function initQuerySeerEvent(obj:{from:string; to:string;}):QuerySeerEvent{
    const {from, to}=obj;
    return {
        type: EVENT_QUERY_SEER,
        from,
        to,
        result: SEER_RESULT_HUMAN
    };
}

//占い実行イベント
export const EVENT_GETFORTUNE = "core.seer.getfortune";
export interface GetfortuneEvent extends Event{
    //占い者
    from: string;
    //占い対象
    to: string;
}
export function initGetfortuneEvent(obj:{from:string; to:string;}):GetfortuneEvent{
    const {from, to} = obj;
    return {
        type: EVENT_GETFORTUNE,
        from,
        to
    };
}

//utility: 占い結果が人狼になるeffect
export function seerEffect(role:string, result:string){
    return [{
        priority: priority.QUERY_RESULT_INIT,
        handler: ({players, event})=>{
            const event2 = event as QuerySeerEvent;
            const pl = players.get(event2.to);
            if(pl && pl.type===role){
                event2.result = result;
            }
        }
    }];
}
