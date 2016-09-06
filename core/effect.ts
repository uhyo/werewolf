import * as lib from '../lib';
import randomID from './lib/random-id';
import {
    Choice,
} from './lib/choice';

export interface Effect extends lib.Effect{
}

export interface EffectOnPlayer extends Effect{
    // on player id
    on: string;
}


// 選択肢の出現
export const EFFECT_CHOICE = 'core.choice';
export interface ChoiceEffect extends EffectOnPlayer{
    // 選択肢の種類
    choice_kind: string;
    // 選択肢のIDと表示
    options: Array<Choice>;
    // 選択された値
    value: string | undefined;
}
// Randomy generates its id.
export function initChoiceEffect(on: string, choice_kind: string, options: Array<Choice>): ChoiceEffect{
    return {
        type: EFFECT_CHOICE,
        id: randomID(),
        on,
        choice_kind,
        options,
        value: undefined,
    };
}

