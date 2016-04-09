import * as lib from '../lib';
import {Player, RoleInfo} from './player';
import {Effect} from './effect';
import {Field} from './field';

export type Package = lib.Package<Player,Effect,Field>;

export interface RolePackage<Pl extends Player> extends Package, RoleInfo<Pl>{
}
