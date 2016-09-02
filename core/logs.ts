// Logs

export interface Log{
    type: string;
}

// 昼と夜の移り変わり
export const LOG_PHASE_TRANSITION = 'log.phase-transition';
type PhaseType = 'day' | 'night';
export interface LogPhaseTransition extends Log{
    // 日数
    day: number;
    // 昼か夜か
    phase: PhaseType;
}
export function initLogPhaseTransition(day: number, phase: PhaseType): LogPhaseTransition {
    return {
        type: LOG_PHASE_TRANSITION,
        day,
        phase,
    };
}
