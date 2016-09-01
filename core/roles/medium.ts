// Medium: 霊能者
import {Player} from '../player';
import {initPackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';
import * as diereason from '../lib/diereason';

import * as mediumevent from './medium.event';

export interface Medium extends Player{
    results: Array<{
        to: string;
        result: string;
    }>;
    shown: number;
}

const ROLE_MEDIUM = 'core.medium';

export default initPackage<Medium>({
    role: ROLE_MEDIUM,
    roleInit(pl){
        pl.results = [];
        pl.shown = -1;
        return pl;
    },
    playerProducers: {
        [ROLE_MEDIUM]: {
            [events.EVENT_DIE]: [{
                priority: priority.DIE_HANDLER,
                handler: ({runner, player, players, event})=>{
                    const event2 = event as events.DieEvent;
                    // 処刑されたことを確認
                    if (event2.prevented !== true && event2.reason===diereason.LYNCH){
                        const pl = players.get(event2.on);
                        if (pl && pl.dead && pl.dead_reason===diereason.LYNCH){
                            // 処刑で死亡したことを確認
                            runner.addEvent(mediumevent.initDoMediumEvent({
                                from: player.id,
                                to: event2.on,
                            }));
                        }
                    }
                },
            }],
        },
    },
    actions: {
        [mediumevent.EVENT_DO_MEDIUM]: ({runner, players, event})=>{
            const event2 = event as mediumevent.DoMediumEvent;
            // 霊能者
            const medium = players.get<Medium>(event2.from);
            if (medium){
                // 霊能結果を得る
                const e = runner.runEvent(mediumevent.initQueryMediumEvent({
                    from: event2.from,
                    to: event2.to,
                }));
                medium.results.push({
                    to: e.to,
                    result: e.result,
                });
            }
        },
    },
});



