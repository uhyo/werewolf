import * as lib from '../lib';

import {VoteBox} from './lib/votebox';

export interface Rule{
}

export const PHASE_DAY = "day";
export const PHASE_NIGHT = "night";

//ゲームのStateだよ
export interface Field extends lib.Field{
    //各種のルール
    rule: Rule;
    //ゲーム状態
    phase: string;
    day: number;

    //昼
    votebox: VoteBox;

    //夜
    /////今夜の残り襲撃回数
    werewolfRemains:number;
    /////人狼の襲撃対象
    werewolfTarget:Array<{
        //襲撃者
        from:string;
        //襲撃先
        to:string;
    }>;
}

export function initField(rule:Rule):Field{
    return {
        rule,
        phase: PHASE_NIGHT,
        day: 0,
        votebox: {},
        werewolfRemains: 0,
        werewolfTarget: [],
    };
}
