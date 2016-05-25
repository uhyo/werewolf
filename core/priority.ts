//EventHandler priorities

//EVENT_JOBの処理を上書きする処理
export const JOB_OVERRIDE = -100;

//EVENT_MIDNIGHTに付随して行われる処理
export const MIDNIGHT_STANDARD = 100;

//EVENT_QUERY_COUNTなどで役職の初期値をセットする処理
export const QUERY_RESULT_INIT = 10;

//EVENT_DIEに反応する処理
export const DIE_HANDLER = 100;
