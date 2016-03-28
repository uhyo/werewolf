//Event Handler.
import {Event, EventAdder} from './event';
import {Player, Players} from './player';

export interface HandlerParam{
    adder:EventAdder;
    players:Players;
    event:Event;
}
export interface EventHandler{
    //less is earlier!
    priority: number;
    //EventHandler should not modify objects other than 'event'.
    handler(obj:HandlerParam):void;
}

export type HandlerProducer = (e:Event)=>Array<EventHandler>;

export type KeyedHandlerProducers = {[key:string]: HandlerProducer};

export type EventAction = (obj:HandlerParam)=>void;
