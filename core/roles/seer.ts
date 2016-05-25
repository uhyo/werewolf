// Seer: 占い師
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';

import * as seerevent from './seer.event';

export interface Seer extends Player{
    results: Array<{to: string; result: string}>;
    shown: number;
}

const ROLE_SEER = 'core.seer';

export default {
    role: ROLE_SEER,
    roleInit(pl){
        pl.results = [];
        pl.shown = -1;
        return pl;
    },
    playerProducers: {
        [ROLE_SEER]: {
            [events.EVENT_MIDNIGHT]: [{
                priority: priority.MIDNIGHT_STANDARD,
                handler: ({runner, player, players, event})=>{
                    // 夜の役職実行
                    if (players.get(player.target)){
                        // 対象が存在
                        runner.addEvent(seerevent.initGetfortuneEvent({
                            from: player.id,
                            to: player.target,
                        }));
                    }
                },
            }],
        },
    },
    actions: {
        [seerevent.EVENT_GETFORTUNE]: ({runner, players, event})=>{
            const event2 = event as seerevent.GetfortuneEvent;
            // 占い者
            const seer = players.get<Seer>(event2.from);
            if (seer){
                // 占い結果を得る
                const e = runner.runEvent(seerevent.initQuerySeerEvent({
                    from: event2.from,
                    to: event2.to,
                }));
                seer.results.push({
                    to: e.to,
                    result: e.result,
                });
            }
        },
    },
} as RolePackage<Seer>;


