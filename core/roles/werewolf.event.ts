// Werewolf Event
import {Event} from '../../lib';

// 狼の対象選択イベント
export const EVENT_JOB_WEREWOLF = 'core.werewolf.job';
export interface JobWerewolfEvent extends Event{
    // 選択者
    from: string;
    // 対象
    to: string;
}
export function initJobWerewolfEvent(obj: {from: string; to: string}): JobWerewolfEvent{
    const {from, to} = obj;
    return {
        type: EVENT_JOB_WEREWOLF,
        from,
        to,
    };
}
