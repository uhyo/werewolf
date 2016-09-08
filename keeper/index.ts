// game keeper.
import {
    Game,
    initGame,
    Package,
    Rule,
} from './game';
import {
    State,
} from './state';
import {
    PHASE_DAY,
    PHASE_NIGHT,
} from '../core/field';

import {
    initPhaseNightEvent,
} from '../core/events';

export class Keeper{
    private game: Game;
    private state: State;
    private rule: Rule;

    private timerid: number | null = null;
    constructor(rule: Rule, pkgs: Array<Package>){
        this.rule = rule;
        this.game = initGame(rule, pkgs);
        this.state = 'prologue';
    }
    // start the game.
    public start(): void{
        if (this.state !== 'prologue'){
            throw new Error('Game has already started');
        }
        // 最初の夜にする
        this.game.runEvent(initPhaseNightEvent());
        this.state = 'playing';

        this.phaseTimer();
    }

    // set appropreate timer.
    private phaseTimer(): void{
        // 今走ってるタイマーがあれば解除
        if (this.timerid != null){
            clearTimeout(this.timerid);
        }
        // ゲーム状態を取得
        const f = this.game.getField();
        let time: number;
        switch (f.phase){
            case PHASE_DAY:
                // 昼だ
                time = this.rule.dayTime;
                break;
            case PHASE_NIGHT:
                time = this.rule.nightTime;
                break;
            default:
                // TODO
                time = 1;
        }
        setTimeout(this.nextPhase.bind(this), time*1000);
    }
    private nextPhase(): void{
        // call the game to go to the next phase.
        // TODO
    }
}


