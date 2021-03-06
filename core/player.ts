import * as lib from '../lib';

export interface Player extends lib.Player{
    // 生死
    dead: boolean;
    // 死んだ場合その理由
    dead_reason?: string;

    // 夜投票の対象（ふつうはID）
    target?: string;
}


// Playerをinitするときのパラメータ
export interface PlayerInit{
    // ID
    id: string;
    // 役職
    type: string;
}

// package
export interface RoleInfo<Pl extends Player>{
    role: string;
    roleInit?(p: Pl): Pl;
}

// Playerをinitするためのクラス
export class PlayerInitiator{
    private inits: {
        [type: string]: (<Pl extends Player>(p: Pl)=>Pl) | undefined;
    } = {};
    add<Pl extends Player>(info: RoleInfo<Pl>): void{
        this.inits[info.role] = info.roleInit;
    }
    initPlayer<Pl extends Player>(obj: PlayerInit): Pl{
        const result = {
            id: obj.id,
            type: obj.type,

            dead: false,
            dead_reason: undefined,
        } as Player;
        // TODO: TS2.1でこのinitiatorは不要？
        const initiator = this.inits[obj.type];
        if (initiator != null){
            const result2 = initiator(result);
            return result2 as Pl;
        }
        return result as Pl;
    }
}

export type Players = lib.Players<Player>;
