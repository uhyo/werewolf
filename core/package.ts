import * as lib from '../lib';
import {Player, RoleInfo} from './player';
import {Effect} from './effect';
import {Field} from './field';
import {
    EventRunner,
    HandlerParam,
    HandlerParamWithPlayer,
    HandlerParamWithEffect,
    HandlerProducer,
    EventActions,
} from './handler';

export type Package = lib.Package<Player, Effect, Field>;

export interface RolePackage<Pl extends Player> extends Package, RoleInfo<Pl>{
}

// XXX ここでlib.Packageのdefに依存しているのはよくない? (partialize operatorかunpartialize operatorがほしい)
interface PartialPackage{
    ruleProducers?: Array<HandlerProducer>;
    playerProducers?: lib.KeyedHandlerProducers<Player, Effect, Field, EventRunner, HandlerParamWithPlayer>;
    effectProducers?: lib.KeyedHandlerProducers<Player, Effect, Field, EventRunner, HandlerParamWithEffect>;
    actions?: EventActions;

}

export function initPackage<Pl extends Player>(p: PartialPackage & RoleInfo<Pl>): RolePackage<Pl>{
    return {
        ruleProducers: p.ruleProducers || [],
        playerProducers: p.playerProducers || {},
        effectProducers: p.effectProducers || {},
        actions: p.actions || {},

        role: p.role,
        roleInit: p.roleInit,
    };
}

