// Event definitions
import {Event} from '../lib';

import * as count from './lib/count';
import {
    Choice,
} from './lib/choice';

// 昼になるevent
export const EVENT_PHASE_DAY = 'core.phase.day';
// 夜になるevent
export const EVENT_PHASE_NIGHT = 'core.phase.night';
// 夜の処理を実行するevent
export const EVENT_MIDNIGHT = 'core.midnight';

// 処刑を実行するevent
export const EVENT_LYNCH = 'core.lynch';

// 処刑投票
export const EVENT_VOTE = 'core.vote';

// 選択肢を追加
export const EVENT_OPENCHOICE = 'core.openchoice';

// 選択肢を選択
export const EVENT_CHOICE = 'core.choice';

// 死亡
export const EVENT_DIE = 'core.die';

// 勝利判定
export const EVENT_JUDGE = 'core.judge';
////////// Queries
// 終了カウントを問い合わせる
export const EVENT_QUERY_COUNT = 'core.query.count';

// 投票終了したかどうか
export const EVENT_QUERY_VOTEDONE = 'core.query.votedone';

// Phase event
export function initPhaseDayEvent(): Event{
    return {
        type: EVENT_PHASE_DAY,
    };
}
export function initPhaseNightEvent(): Event{
    return {
        type: EVENT_PHASE_NIGHT,
    };
}
export function initMidnightEvent(): Event{
    return {
        type: EVENT_MIDNIGHT,
    };
}

// 投票するイベント
export interface VoteEvent extends Event{
    // 投票者
    from: string;
    // 投票先
    to: string;
    // 票数
    num: number;
    // 優先度
    priority: number;
}
export function initVoteEvent(obj: {
    from: string;
    to: string;
    num: number;
    priority: number;
}): VoteEvent{
    const {from, to, num, priority} = obj;
    return {
        type: EVENT_VOTE,
        from,
        to,
        num,
        priority,
    };
}

// 処刑をするイベント
export interface LynchEvent extends Event{
    // 投票結果がどうなったか
    voteResult: string | undefined;
}
export function initLynchEvent(): LynchEvent{
    return {
        type: EVENT_LYNCH,
        voteResult: undefined,
    };
}

// 選択肢を追加するイベント
export interface OpenChoiceEvent extends Event{
    // 誰の選択肢か
    on: string;
    // 選択肢の種類
    kind: string;
    // 選択肢
    options: Array<Choice>;
}
export function initOpenChoiceEvent(obj: {
    on: string;
    kind: string;
    options: Array<Choice>;
}): OpenChoiceEvent{
    const {
        on,
        kind,
        options,
    } = obj;
    return {
        type: EVENT_OPENCHOICE,
        on,
        kind,
        options,
    };
}

// 選択肢を選択するイベント
export interface ChoiceEvent extends Event{
    // 選択者
    from: string;
    // 選択肢ID
    choice_id: string;
    // 対象
    value: string;
}
export function initChoiceEvent(obj: {
    from: string;
    choice_id: string;
    value: string;
}): ChoiceEvent{
    const {from, choice_id, value} = obj;
    return {
        type: EVENT_CHOICE,
        from,
        choice_id,
        value,
    };
}


// 死亡するイベント
export interface DieEvent extends Event{
    // 誰が死亡するか
    on: string;
    // 死因
    reason: string;
}
export function initDieEvent(obj: {
    on: string;
    reason: string;
}): DieEvent{
    const {on, reason} = obj;
    return {
        type: EVENT_DIE,
        on,
        reason,
    };
}

// 勝利判定
export interface JudgeEvent extends Event{
    // ゲーム終了か
    end: boolean;
    // 引き分けフラグ
    draw: boolean;
    // 勝利陣営
    result: string | undefined;
}
export function initJudgeEvent(): JudgeEvent{
    return {
        type: EVENT_JUDGE,
        end: false,
        draw: false,
        result: undefined,
    };
}

// Query
export interface QueryCountEvent extends Event{
    // 誰
    on: string;
    // 結果
    count: string;
}
export function initQueryCountEvent(on: string): QueryCountEvent{
    return {
        type: EVENT_QUERY_COUNT,
        on,
        count: count.COUNT_HUMAN,
    };
}

export interface QueryVotedoneEvent extends Event{
    // 誰
    on: string;
    // 結果
    result: boolean;
}
export function initQueryVotedoneEvent(on: string): QueryVotedoneEvent{
    return {
        type: EVENT_QUERY_VOTEDONE,
        on,
        result: false,
    };
}
