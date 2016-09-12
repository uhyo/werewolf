import * as extend from 'extend';

// Effects
export interface Effect{
    // unique id of an effect.
    id: string;
    // type of an effect.
    type: string;
}

// Effects
export class Effects<Ef extends Effect>{
    private effects: Array<Ef> = [];
    public length: number = 0;
    add(e: Ef): void{
        this.effects.push(e);
        this.length = this.effects.length;
    }
    removeById(id: string): void{
        this.effects = this.effects.filter(e=> id !== e.id);
        this.length = this.effects.length;
    }
    get<Ef2 extends Ef>(idx: number | string): Ef2 | undefined{
        if ('number' === typeof idx){
            return this.effects[idx] as Ef2;
        }else{
            /* TODO */
            const l = this.effects.length;
            for (let i = 0; i < l; i++){
                const e = this.effects[i];
                if (e.id === idx){
                    return e as Ef2;
                }
            }
            return undefined;
        }
    }
    ofType<Ef2 extends Ef>(t: string): Array<Ef2>{
        return (this.effects as Array<Ef2>).filter(({type})=> t === type);
    }
    asArray(): Array<Ef>{
        return this.effects.concat([]);
    }
    deepClone(): Effects<Ef>{
        const ret = new Effects<Ef>();
        for (let e of this.effects){
            ret.add(extend(true, {}, e));
        }
        return ret;
    }
}
