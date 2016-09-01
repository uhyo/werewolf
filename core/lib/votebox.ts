// Voting box
import * as extend from 'extend';

// 1つの票
export interface Vote{
    // 票を入れた人
    from: string;
    // 票の宛先(Player ID)
    to: string;
    // 票数
    num: number;
    // 優先度
    priority: number;
}
export interface VoteBox{
    [id: string]: Vote;
}

// 票カウント
export const VOTERESULT_CHOSEN = 'chosen';  // 結果があった
export const VOTERESULT_MULTI = 'multi';    // 複数人いる
export const VOTERESULT_NONE = 'none';     // 無効
export interface VoteResult{
    // 結果の種類
    result: string;
    // 選ばれたひと
    ids: Array<string>;
}

// VoteBox functions
export function initVoteBox(): VoteBox{
    return {};
}

// add new vote to VoteBox.
// If a bote already exists in the box, the vote will be replaced.
export function addVote(box: VoteBox, obj: Vote): void{
    box[obj.from] = extend({}, obj);
}
export function countVotes(box: VoteBox): VoteResult{
    // 票数をカウント
    const cnt: {[id: string]: Vote} = {};
    for (let fromid in box){
        const {to, num, priority} = box[fromid];
        // numはsum, priorityはmaxをとる
        if (cnt[to] == null){
            cnt[to] = {
                from: 'DUMMY',
                to,
                num,
                priority,
            };
        }else{
            cnt[to].num += num;
            if (priority > cnt[to].priority){
                cnt[to].priority = priority;
            }
        }
    }
    // 票の獲得順にソートする
    const ids = Object.keys(cnt);
    ids.sort((a, b)=> cnt[b].num-cnt[a].num || cnt[b].priority-cnt[a].priority);

    // 結果を返す
    if (ids.length===0){
        return {
            result: VOTERESULT_NONE,
            ids,
        };
    }else if (ids.length===1){
        return {
            result: VOTERESULT_CHOSEN,
            ids,
        };
    }else{
        // 複数人いるかもしれない
        const top = cnt[ids[0]];
        const chosen: Array<string> = [];
        for (let id of ids){
            const c = cnt[id];
            if (c.num===top.num && c.priority===top.priority){
                chosen.push(id);
            }else{
                break;
            }
        }
        return {
            result: chosen.length===1 ? VOTERESULT_CHOSEN : VOTERESULT_MULTI,
            ids: chosen,
        };
    }
}
