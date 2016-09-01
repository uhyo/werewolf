import * as lib from '../lib';
import {Player, RoleInfo} from './player';
import {Effect} from './effect';
import {Field} from './field';

export type EventRunner = lib.EventRunner<Player, Effect, Field>;

export type HandlerParam = lib.HandlerParam<Player, Effect, Field, lib.Event, EventRunner>;
export type HandlerParamWithPlayer = lib.HandlerParamWithPlayer<Player, Effect, Field, lib.Event, EventRunner>;
export type HandlerParamWithEffect = lib.HandlerParamWithEffect<Player, Effect, Field, lib.Event, EventRunner>;

export type HandlerProducer = lib.HandlerProducer<Player, Effect, Field, EventRunner, HandlerParam>;

export type EventHandler = lib.EventHandler<Player, Effect, Field, lib.Event, EventRunner, HandlerParam>;

export type EventAction = lib.EventAction<Player, Effect, Field, lib.Event, EventRunner>;

export type EventActions = lib.EventActions<Player, Effect, Field, EventRunner>;
