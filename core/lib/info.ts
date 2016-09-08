// Info of players that is show to each user.
import {
    Choice,
} from './choice';

interface OpenChoice{
    // 選択肢の種類
    kind: string;
    // 選択肢
    options: Array<Choice>;
    // 選択されている値
    value: string | undefined;
}
export interface PlayerInfo{
    // player id.
    id: string;
    // Role ID displayed to user.
    roleDisp: string | undefined;
    // dead or alive
    dead: boolean | undefined;

    // choices open to you
    choices: Array<OpenChoice>;

    // other data.
    data: {
        [key: string]: any;
    };
}
