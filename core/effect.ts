import * as lib from '../lib';

export interface Effect extends lib.Effect{
}

export interface EffectOnPlayer extends Effect{
    //on player id
    on: string;
}
