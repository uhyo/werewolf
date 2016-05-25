// Event Handler.
import {Event} from './event';
import {Player, Players} from './player';
import {Effect} from './effect';
import {Field} from './field';

// EventRunnerとは……
interface IEventRunner<P extends Player, Ef extends Effect, F extends Field>{
    runEvent<Ev extends Event>(e: Ev): Ev;
}

export interface HandlerParam<Pl extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<Pl, Ef, F>>{
    players: Players<Pl>;
    effects: Array<Ef>;
    field: F;
    event: Ev;
    runner: R;
}

// 付加情報つきHandlerParam
export interface HandlerParamWithPlayer<Pl extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<Pl, Ef, F>> extends HandlerParam<Pl, Ef, F, Ev, R>{
    player: Pl;
}
export interface HandlerParamWithEffect<Pl extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<Pl, Ef, F>> extends HandlerParam<Pl, Ef, F, Ev, R>{
    effect: Ef;
}

export interface EventHandler<Pl extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<Pl, Ef, F>, Pr extends HandlerParam<Pl, Ef, F, Ev, R>>{
    // less is earlier!
    priority: number;
    // EventHandler should not modify objects other than 'event'.
    handler(obj: Pr): void;
}

export type HandlerProducer<Pl extends Player, Ef extends Effect, F extends Field, R extends IEventRunner<Pl, Ef, F>, Pr extends HandlerParam<Pl, Ef, F, Event, R>> = {[ev: string]: Array<EventHandler<Pl, Ef, F, Event, R, Pr>>};

export type KeyedHandlerProducers<Pl extends Player, Ef extends Effect, F extends Field, R extends IEventRunner<Pl, Ef, F>, Pr extends HandlerParam<Pl, Ef, F, Event, R>> = {[key: string]: HandlerProducer<Pl, Ef, F, R, Pr>};

export type EventAction<P extends Player, Ef extends Effect, F extends Field, Ev extends Event, R extends IEventRunner<P, Ef, F>> = (obj: HandlerParam<P, Ef, F, Ev, R>)=>void;

export type EventActions<P extends Player, Ef extends Effect, F extends Field, R extends IEventRunner<P, Ef, F>> = {[key: string]: EventAction<P, Ef, F, Event, R>};

