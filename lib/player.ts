///<reference path="../typings/bundle.d.ts" />
import * as extend from 'extend';

export interface Player{
    // ID
    id: string;

    // 役職
    type: string;
}

// Players: static list of players, also support ids.
export class Players<P extends Player>{
    private players: Array<P> = [];
    public length: number;
    add(p: P): void{
        this.players.push(p);
        this.length = this.players.length;
    }
    get<P2 extends P>(idx: number|string): P2{
        if ('number' === typeof idx){
            return this.players[idx];
        }else{
            const l = this.players.length;
            for (let i = 0; i < l; i++){
                const p = this.players[i];
                if (p.id === idx){
                    return p as P2;
                }
            }
            return void 0;
        }
    }
    // structure utility
    asArray(): Array<P>{
        return this.players.concat([]);
    }
    deepClone(): /* this */Players<P>{
        const ret = new Players<P>();
        for (let p of this.players){
            ret.add(extend(true, {}, p));
        }
        return ret;
    }
}
