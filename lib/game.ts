// Game System.
///<reference path="../typings/bundle.d.ts" />

import * as extend from 'extend';

import {Event, EventBase, EventAdder} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

import {HandlerParam, HandlerParamWithPlayer, HandlerParamWithEffect, EventHandler, HandlerProducer, KeyedHandlerProducers, EventAction, EventActions} from './handler';

// rule package
export interface Package<P extends Player, E extends Effect, F extends Field>{
    ruleProducers: Array<HandlerProducer<P, E, F, EventRunner<P, E, F>, HandlerParam<P, E, F, Event, EventRunner<P, E, F>>>>;
    playerProducers: KeyedHandlerProducers<P, E, F, EventRunner<P, E, F>, HandlerParamWithPlayer<P, E, F, Event, EventRunner<P, E, F>>>;
    effectProducers: KeyedHandlerProducers<P, E, F, EventRunner<P, E, F>, HandlerParamWithEffect<P, E, F, Event, EventRunner<P, E, F>>>;
    actions: EventActions<P, E, F, EventRunner<P, E, F>>;
}

export class Game<P extends Player, E extends Effect, F extends Field>{
    private players: Players<P>;
    private effects: Array<E>;
    private field: F;
    // producers
    private ruleProducers: Array<HandlerProducer<P, E, F, EventRunner<P, E, F>, HandlerParam<P, E, F, Event, EventRunner<P, E, F>>>>;
    private playerProducers: KeyedHandlerProducers<P, E, F, EventRunner<P, E, F>, HandlerParamWithPlayer<P, E, F, Event, EventRunner<P, E, F>>>;
    private effectProducers: KeyedHandlerProducers<P, E, F, EventRunner< P, E, F>, HandlerParamWithEffect<P, E, F, Event, EventRunner<P, E, F>>>;
    // actions
    private actions: EventActions<P, E, F, EventRunner<P, E, F>>;
    constructor(initField: F){
        this.players = new Players<P>();
        this.effects = [];
        this.field = initField;

        this.ruleProducers = [];
        this.playerProducers = {};
        this.effectProducers = {};

        this.actions = {};
    }
    // producer loaders
    public loadRuleProducers(ps: Array<HandlerProducer<P, E, F, EventRunner<P, E, F>, HandlerParam<P, E, F, Event, EventRunner<P, E, F>>>>): void{
        this.ruleProducers.push(...ps);
    }
    public loadPlayerProducers(ps: KeyedHandlerProducers<P, E, F, EventRunner<P, E, F>, HandlerParamWithPlayer<P, E, F, Event, EventRunner<P, E, F>>>): void{
        extend(false, this.playerProducers, ps);
    }
    public loadEffectProducers(ps: KeyedHandlerProducers<P, E, F, EventRunner<P, E, F>, HandlerParamWithEffect<P, E, F, Event, EventRunner<P, E, F>>>): void{
        extend(false, this.effectProducers, ps);
    }
    public loadActions(acts: {[event: string]: EventAction<P, E, F, Event, EventRunner<P, E, F>>}): void{
        extend(false, this.actions, acts);
    }
    public loadPackage(p: Package<P, E, F>): void{
        if (p.ruleProducers){
            this.loadRuleProducers(p.ruleProducers);
        }
        if (p.playerProducers){
            this.loadPlayerProducers(p.playerProducers);
        }
        if (p.effectProducers){
            this.loadEffectProducers(p.effectProducers);
        }
        if (p.actions){
            this.loadActions(p.actions);
        }
    }

    // add player.
    addPlayer(p: P): void{
        this.players.add(p);
    }

    // run all events.
    runEvent<Ev extends Event>(e: Ev): Ev{
        const resultObject = {} as {players: Players<P>; effects: Array<E>; field: F};
        const runner = new EventRunner(this.players, this.effects, this.field, {
            ruleProducers: this.ruleProducers,
            playerProducers: this.playerProducers,
            effectProducers: this.effectProducers,
            actions: this.actions,
        },
        null,
        resultObject);
        runner.runEvent(e);
        this.players = resultObject.players;
        this.effects = resultObject.effects;
        this.field   = resultObject.field;
        return e;
    }
    // ----------
    // Getter.
    public getPlayers(): Players<P>{
        return process.env.NODE_ENV === 'production' ? this.players : this.players.deepClone();
    }
    public getField(): F{
        // copy to protect from modification
        return process.env.NODE_ENV === 'production' ? this.field : extend(true, {}, this.field);
    }
}

// イベントの実行を担当
export class EventRunner<P extends Player, Ef extends Effect, F extends Field>{
    // 実行コンテキストで参照されるオブジェクト
    private players: Players<P>;
    private effects: Array<Ef>;
    private field: F;
    constructor(players: Players<P>, effects: Array<Ef>, field: F, private handlers: Package<P, Ef, F>, private base: EventBase | null, private resultObject?: {
        players?: Players<P>;
        effects?: Array<Ef>;
        field?: F;
    }){
        this.players = safetyClone.players(players);
        this.effects = safetyClone.effects(effects);
        this.field   = safetyClone.field(field);
    }
    private runOneEvent<Ev extends Event>(e: Ev, subrunner: EventRunner<P, Ef, F>): Ev{
        type Hn = EventHandler<P, Ef, F, Ev, EventRunner<P, Ef, F>, HandlerParam<P, Ef, F, Ev, EventRunner<P, Ef, F>>> & {player?: P; effect?: Ef};
        const handlers: Array<Hn> = [];
        // from ruleProducers
        for (let pr of this.handlers.ruleProducers){
            const es = pr[e.type];
            if (Array.isArray(es)){
                handlers.push(...es);
            }
        }
        // from playerProducers
        for (let pl of this.players.asArray()){
            const pr = this.handlers.playerProducers[pl.type];
            if (pr){
                const es = pr[e.type];
                if (Array.isArray(es)){
                    handlers.push(...(es.map(e => extend({player: safetyClone.player(pl)}, e))));
                }
            }
        }
        // from effectProducers
        for (let ef of this.effects){
            const pr = this.handlers.effectProducers[ef.type];
            if (pr){
                const es = pr[e.type];
                if (Array.isArray(es)){
                    handlers.push(...(es.map(()=> extend({effect: safetyClone.effect(ef)}, ef))));
                }
            }
        }
        // sort handlers
        sortHandlers(handlers);
        // 0未満と0以上に分ける
        let before: Array<Hn>;
        let after: Array<Hn>;
        let i: number;
        const l = handlers.length;
        for (i = 0; i < l; i++){
            const h = handlers[i];
            if (h.priority >= 0){
                break;
            }
        }
        // before(0未満): 先に実行
        before = handlers.slice(0, i);
        // after(0以上): 後に実行
        after = handlers.slice(i);

        for (let {player, effect, handler} of before){
            // handlerに渡すparam
            const param: HandlerParam<P, Ef, F, Ev, EventRunner<P, Ef, F>> = {
                runner: subrunner,
                // productionではcloneしない（高速化）
                players: safetyClone.players(this.players),
                effects: safetyClone.effects(this.effects),
                field: safetyClone.field(this.field),
                event: e,
            };
            // ここ型システムの敗北（めんどいだけ）
            if (player){
                (param as any).player = player;
            }
            if (effect){
                (param as any).effect = effect;
            }
            handler(param);
        }

        if (e.prevented !== true){
            // Run Game-state-modifying action here.
            const action = this.handlers.actions[e.type];
            if (action){
                const param: HandlerParam<P, Ef, F, Ev, EventRunner<P, Ef, F>> = {
                    runner: subrunner,
                    players: this.players,
                    effects: this.effects,
                    field: this.field,
                    event: e,
                };
                action(param);
            }
        }


        for (let {player, effect, handler} of after){
            const param = {
                runner: subrunner,
                players: safetyClone.players(this.players),
                effects: safetyClone.effects(this.effects),
                field: safetyClone.field(this.field),
                event: e,
            };
            if (player){
                (param as any).player = player;
            }
            if (effect){
                (param as any).effect = effect;
            }
            handler(param);
        }
        return e;
    }
    runEvent<Ev extends Event>(e: Ev): Ev{
        // 新しい環境で
        const base = new EventBase();
        base.addEvent(e);
        const subrunner = this.branchRunner(base);
        let ev: Event | undefined;
        while (ev = base.iterateEvent()){
            this.runOneEvent(ev, subrunner);
        }
        // 結果を提供する
        if (this.resultObject != null){
            this.resultObject.players = this.players;
            this.resultObject.effects = this.effects;
            this.resultObject.field   = this.field;
        }
        return e;
    }
    addEvent<Ev extends Event>(e: Ev): void{
        const base = this.base;
        if (base == null){
            throw new Error('Cannot add an event to a null-based EventRunner');
        }
        base.addEvent(e);
    }
    // get result

    private branchRunner(base: EventBase): EventRunner<P, Ef, F>{
        // baseを通して自身に干渉できる
        return new EventRunner(this.players, this.effects, this.field, this.handlers, base, void 0);
    }
}

// sort handlers by priority.
function sortHandlers<P extends Player, Ef extends Effect, F extends Field, Ev extends Event>(handlers: Array<EventHandler<P, Ef, F, Ev, EventRunner<P, Ef, F>, HandlerParam<P, Ef, F, Ev, EventRunner<P, Ef, F>>>>): void{
    handlers.sort((a, b)=> a.priority - b.priority);
}

// safety clone utility
namespace safetyClone{
    export function player<P extends Player>(pl: P): P{
        return process.env.NODE_ENV==='production' ? pl : extend(true, {}, pl);
    }
    export function players<P extends Player>(pl: Players<P>): Players<P>{
        return process.env.NODE_ENV==='production' ? pl : pl.deepClone();
    }
    export function effect<Ef extends Effect>(ef: Ef): Ef{
        return process.env.NODE_ENV==='production' ? ef : extend(true, {}, ef);
    }
    export function effects<Ef extends Effect>(efs: Array<Ef>): Array<Ef>{
        return process.env.NODE_ENV==='production' ? efs : efs.map(ef => extend(true, {}, ef));
    }
    export function field<F extends Field>(f: F): F{
        return process.env.NODE_ENV==='production' ? f : extend(true, {}, f);
    }
}
