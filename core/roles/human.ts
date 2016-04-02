//Human: 村人
import {Player} from '../player';
import {RolePackage} from '../package';

export type Human = Player;

const ROLE_HUMAN = "human";

export default {
    role: ROLE_HUMAN
} as RolePackage;
