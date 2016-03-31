//Game System.
///<reference path="../typings/bundle.d.ts" />

import * as extend from 'extend';

import {Event, EventBase, EventAdder} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

import {HandlerParam, EventHandler, HandlerProducer, KeyedHandlerProducers, EventAction} from './handler';

export class Game<P extends Player, E extends Effect, F extends Field>{
    private base:EventBase;
    private players:Players<P>;
    private effects:Array<E>;
    private field:F;
    //producers
    private ruleProducers:Array<HandlerProducer<P,E,F>>;
    private playerProducers:KeyedHandlerProducers<P,E,F>;
    private effectProducers:KeyedHandlerProducers<P,E,F>;
    //actions
    private actions:{[event:string]:EventAction<P,E,F>};
    constructor(initField:F){
        this.players = new Players<P>();
        this.base = new EventBase();
        this.field = initField;

        this.ruleProducers = [];
        this.playerProducers = {};
        this.effectProducers = {};

        this.actions = {};
    }
    //producer loaders
    public loadRuleProducers(ps:Array<HandlerProducer<P,E,F>>):void{
        this.ruleProducers.push(...ps);
    }
    public loadPlayerProducers(ps:KeyedHandlerProducers<P,E,F>):void{
        extend(false, this.playerProducers, ps);
    }
    public loadEffectProducers(ps:KeyedHandlerProducers<P,E,F>):void{
        extend(false, this.effectProducers, ps);
    }
    public loadActions(acts:{[event:string]:EventAction<P,E,F>}):void{
        extend(false, this.actions, acts);
    }

    //add player.
    addPlayer(p:P):void{
        this.players.add(p);
    }

    //Handle one Event.
    handleEvent(e:Event):Event{
        const handlers:Array<EventHandler<P,E,F>> = [];
        //from ruleProducers
        for(let pr of this.ruleProducers){
            const es = pr(e);
            handlers.push(...es);
        }
        //from playerProducers
        for(let pl of this.players.asArray()){
            const pr = this.playerProducers[pl.type];
            if(pr){
                const es = pr(e);
                handlers.push(...es);
            }
        }
        //from effectProducers
        for(let ef of this.effects){
            const pr = this.effectProducers[ef.type];
            if(pr){
                const es = pr(e);
                handlers.push(...es);
            }
        }
        //sort handlers
        sortHandlers(handlers);

        //途中でEventが発生したときの受け皿
        const adder = this.base.getAdder();

        //handlerに渡すparam
        const param:HandlerParam<P,E,F> = {
            adder,
            //productionではcloneしない（高速化）
            players: process.env.NODE_ENV === 'production' ? this.players : this.players.deepClone(),
            effects: process.env.NODE_ENV === 'production' ? this.effects : this.effects.map(e => extend(true,{},e)),
            field: process.env.NODE_ENV === 'production' ? this.field : extend(true,{},this.field),
            event: e
        };
        for(let {handler} of handlers){
            handler(param);
        }

        return e;
    }
    //run one event.
    runEvent(e:Event):Event{
        this.handleEvent(e);

        if(e.prevented !== true){
            //Run Game-state-modifying action here.
            const action = this.actions[e.type];
            if(action){
                action({
                    adder: this.base.getAdder(),
                    players: this.players,
                    effects: this.effects,
                    field: this.field,
                    event: e
                });
            }
        }
        return e;
    }
    //run all events.
    runAllEvents(e:Event):Event{
        const base = this.base;
        base.addEvent(e);
        let ev:Event;
        while(ev = base.iterateEvent()){
            this.runEvent(ev);
        }
        return e;
    }
}

//sort handlers by priority.
function sortHandlers<P extends Player,E extends Effect,F extends Field>(handlers:Array<EventHandler<P,E,F>>):void{
    handlers.sort((a,b)=> a.priority - b.priority);
}
