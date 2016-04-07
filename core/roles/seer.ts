//Werewolf: 人狼
import {Player} from '../player';
import {RolePackage} from '../package';

import * as events from '../events';
import * as priority from '../priority';
import * as count from '../lib/count';

import * as seerevent from './seer.event';

export interface Seer extends Player{
}

const ROLE_SEER = "core.seer";

export default {
    role: ROLE_SEER,
    playerProducers: {
        [ROLE_SEER]: {
        }
    }
} as RolePackage;


