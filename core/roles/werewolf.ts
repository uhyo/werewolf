//Werewolf: 人狼
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';

import * as seerevent from './seer.event';
import * as mediumevent from './medium.event';

export interface Werewolf extends Player{
}

const ROLE_WEREWOLF = "core.werewolf";

export default {
    role: ROLE_WEREWOLF,
    playerProducers: {
        [ROLE_WEREWOLF]: {
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
            [seerevent.EVENT_QUERY_SEER]: seerevent.seerEffect(ROLE_WEREWOLF, seerevent.SEER_RESULT_WEREWOLF),
            [mediumevent.EVENT_QUERY_MEDIUM]: mediumevent.mediumEffect(ROLE_WEREWOLF, mediumevent.MEDIUM_RESULT_WEREWOLF)
        }
    }
} as RolePackage;

