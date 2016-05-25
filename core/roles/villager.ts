// Human: 村人
import {Player} from '../player';
import {RolePackage} from '../package';

export type Villager = Player;

const ROLE_VILLAGER = 'core.villager';

export default {
    role: ROLE_VILLAGER,
} as RolePackage<Villager>;
