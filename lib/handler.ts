//Event Handler.
import {Event} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

//EventRunnerとは……
interface IEventRunner<P extends Player, Ef extends Effect, F extends Field>{
    runEvent<Ev extends Event>(e:Ev):Ev;
}

export interface HandlerParam<P extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<P,Ef,F>>{
    players:Players<P>;
    effects:Array<Ef>;
    field:F;
    event:Ev;
    runner:R;
}
export interface EventHandler<P extends Player, Ef extends Effect, F extends Field, Ev extends Event,R extends IEventRunner<P,Ef,F>>{
    //less is earlier!
    priority: number;
    //EventHandler should not modify objects other than 'event'.
    handler(obj:HandlerParam<P,Ef,F,Ev,R>):void;
}

export type HandlerProducer<P extends Player, Ef extends Effect, F extends Field, R extends IEventRunner<P,Ef,F>> = {[ev:string]:Array<EventHandler<P,Ef,F,Event,R>>};

export type KeyedHandlerProducers<P extends Player, E extends Effect, F extends Field, R extends IEventRunner<P,E,F>> = {[key:string]: HandlerProducer<P,E,F,R>};

export type EventAction<P extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<P,Ef,F>> = (obj:HandlerParam<P,Ef,F,Ev,R>)=>void;

export type EventActions<P extends Player, Ef extends Effect, F extends Field, R extends IEventRunner<P,Ef,F>> = {[key:string]: EventAction<P,Ef,F,Event,R>};

