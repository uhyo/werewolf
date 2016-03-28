//Game System.
///<reference path="../typings/bundle.d.ts" />

import * as extend from 'extend';

import {Event, EventBase, EventAdder} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

import {HandlerParam, EventHandler, HandlerProducer, KeyedHandlerProducers, EventAction} from './handler';

export class Game{
    private base:EventBase;
    private players:Players;
    private effects:Array<Effect>;
    //producers
    private ruleProducers:Array<HandlerProducer>;
    private playerProducers:KeyedHandlerProducers;
    private effectProducers:KeyedHandlerProducers;
    //actions
    private actions:{[event:string]:EventAction};
    constructor(){
        this.players = new Players();
        this.base = new EventBase();

        this.ruleProducers = [];
        this.playerProducers = {};
        this.effectProducers = {};

        this.actions = {};
    }
    //producer loaders
    public loadRuleProducers(ps:Array<HandlerProducer>):void{
        this.ruleProducers.push(...ps);
    }
    public loadPlayerProducers(ps:KeyedHandlerProducers):void{
        extend(false, this.playerProducers, ps);
    }
    public loadEffectProducers(ps:KeyedHandlerProducers):void{
        extend(false, this.effectProducers, ps);
    }
    public loadActions(acts:{[event:string]:EventAction}):void{
        extend(false, this.actions, acts);
    }

    //Handle one Event.
    handleEvent(e:Event):Event{
        const handlers:Array<EventHandler> = [];
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
        const param:HandlerParam = {
            adder,
            //productionではcloneしない（高速化）
            players: process.env.NODE_ENV === 'production' ? this.players : this.players.deepClone(),
            event: e
        };
        for(let {handler} of handlers){
            handler(param);
        }

        return e;
    }
    //run one event.
    runEvent(e:Event):void{
        this.handleEvent(e);

        //Run Game-state-modifying action here.
        const action = this.actions[e.type];
        if(action){
            action({
                adder: this.base.getAdder(),
                players: this.players,
                event: e
            });
        }
    }
    //run all events.
    runAllEvents(e:Event):void{
        const base = this.base;
        base.addEvent(e);
        let ev:Event;
        while(ev = base.iterateEvent()){
            this.runEvent(ev);
        }
    }
}

//sort handlers by priority.
function sortHandlers(handlers:Array<EventHandler>):void{
    handlers.sort((a,b)=> a.priority - b.priority);
}
