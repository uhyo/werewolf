//Event Handler.
import {Event, EventAdder} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

export interface HandlerParam<P extends Player, E extends Effect, F extends Field>{
    adder:EventAdder;
    players:Players<P>;
    effects:Array<E>;
    field:F;
    event:Event;
}
export interface EventHandler<P extends Player, E extends Effect, F extends Field>{
    //less is earlier!
    priority: number;
    //EventHandler should not modify objects other than 'event'.
    handler(obj:HandlerParam<P,E,F>):void;
}

export type HandlerProducer<P extends Player, E extends Effect, F extends Field> = {[ev:string]:Array<EventHandler<P,E,F>>};

export type KeyedHandlerProducers<P extends Player, E extends Effect, F extends Field> = {[key:string]: HandlerProducer<P,E,F>};

export type EventAction<P extends Player, E extends Effect, F extends Field> = (obj:HandlerParam<P,E,F>)=>void;

export type EventActions<P extends Player, E extends Effect, F extends Field> = {[key:string]: EventAction<P,E,F>};
