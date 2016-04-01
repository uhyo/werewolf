import * as lib from '../lib';

export interface Player extends lib.Player{
    //生死
    dead: boolean;
    //死んだ場合その理由
    dead_reason?: string;

    //夜投票の対象（ふつうはID）
    target?: string;
}


//Playerをinitするときのパラメータ
export interface PlayerInit{
    //ID
    id: string;
    //役職
    type: string;
}

export function initPlayer(obj:PlayerInit):Player{
    return {
        id: obj.id,
        type: obj.type,

        dead: false,
        dead_reason: null
    };
}
