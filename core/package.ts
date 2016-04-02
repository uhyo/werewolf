import * as lib from '../lib';
import {Player} from './player';
import {Effect} from './effect';
import {Field} from './field';

export type Package = lib.Package<Player,Effect,Field>;

export interface RolePackage extends Package{
    //役職名もついている
    role: string;
}
