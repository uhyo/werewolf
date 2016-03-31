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
    votebox?: VoteBox;
}

export function initField(rule:Rule):Field{
    return {
        rule,
        phase: PHASE_NIGHT,
        day: 0
    };
}
