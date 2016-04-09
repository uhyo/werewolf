//Medium: 霊能者
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';

import * as mediumevent from './medium.event';

export interface Medium extends Player{
}

const ROLE_MEDIUM = "core.medium";

export default {
    role: ROLE_MEDIUM
} as RolePackage<Medium>;



