///<reference path="../typings/bundle.d.ts" />
import * as extend from 'extend';

export interface Player{
    //ID
    id:string;

    //役職
    type:string;
}

//Players: static list of players, also support ids.
export class Players{
    private players:Array<Player> = [];
    public length:number;
    add(p:Player):void{
        this.players.push(p);
        this.length = this.players.length;
    }
    get(idx:number|string):Player{
        if("number"===typeof idx){
            return this.players[idx];
        }else{
            const l=this.players.length;
            for(let i=0; i<l; i++){
                const p=this.players[i];
                if(p.id===idx){
                    return p;
                }
            }
            return void 0;
        }
    }
    //structure utility
    asArray():Array<Player>{
        return this.players.concat([]);
    }
    deepClone():/* this */Players{
        const ret = new Players();
        for(let p of this.players){
            ret.add(extend(true, {}, p));
        }
        return ret;
    }
}
