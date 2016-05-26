///<reference path='../../../typings/bundle.d.ts' />

import {Vote, VoteBox, VoteResult, initVoteBox, addVote, countVotes,
        VOTERESULT_CHOSEN, VOTERESULT_MULTI, VOTERESULT_NONE} from '../../../core/lib/votebox';
describe('votebox', ()=>{
    let box: VoteBox;
    beforeEach(()=>{
        box = initVoteBox();
    });

    it('Empty votebox is an empty object', ()=>{
        expect(box).toEqual({});
    });

    describe('voting', ()=>{
        it('Adding a vote to the box', ()=>{
            const v: Vote = {
                from: 'foo',
                to: 'bar',
                num: 1,
                priority: 0,
            };
            addVote(box, v);
            expect(box).toEqual({
                foo: {
                    from: 'foo',
                    to: 'bar',
                    num: 1,
                    priority: 0,
                },
            });

            const v2: Vote = {
                from: 'bar',
                to: 'baz',
                num: 2,
                priority: 0,
            };
            addVote(box, v2);
            expect(box).toEqual({
                foo: {
                    from: 'foo',
                    to: 'bar',
                    num: 1,
                    priority: 0,
                },
                bar: {
                    from: 'bar',
                    to: 'baz',
                    num: 2,
                    priority: 0,
                },
            });
        });

        it('Replacing a vote', ()=>{
            addVote(box, {
                from: 'foo',
                to: 'bar',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'foo',
                to: 'baz',
                num: 1,
                priority: 0,
            });
            expect(box).toEqual({
                foo: {
                    from: 'foo',
                    to: 'baz',
                    num: 1,
                    priority: 0,
                },
            });
        });
    });
    describe('counting', ()=>{
        it('none for empty box', ()=>{
            expect(countVotes(box)).toEqual({
                result: VOTERESULT_NONE,
                ids: [],
            });
        });
        it('chosen for non-tie box (sum of num)', ()=>{
            addVote(box, {
                from: 'id1',
                to: 'baz',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id2',
                to: 'baz',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id3',
                to: 'bar',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id4',
                to: 'bar',
                num: 2,
                priority: 0,
            });
            expect(countVotes(box)).toEqual({
                result: VOTERESULT_CHOSEN,
                ids: ['bar'],
            });
        });
        it('chosen for non-tie box (priority)', ()=>{
            addVote(box, {
                from: 'id1',
                to: 'baz',
                num: 1,
                priority: 1,
            });
            addVote(box, {
                from: 'id2',
                to: 'baz',
                num: 2,
                priority: 0,
            });
            addVote(box, {
                from: 'id3',
                to: 'bar',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id4',
                to: 'bar',
                num: 2,
                priority: 0,
            });
            expect(countVotes(box)).toEqual({
                result: VOTERESULT_CHOSEN,
                ids: ['baz'],
            });
        });
        it('multi', ()=>{
            addVote(box, {
                from: 'id1',
                to: 'baz',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id2',
                to: 'baz',
                num: 2,
                priority: 0,
            });
            addVote(box, {
                from: 'id3',
                to: 'bar',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id4',
                to: 'bar',
                num: 2,
                priority: 0,
            });
            expect(countVotes(box)).toEqual({
                result: VOTERESULT_MULTI,
                ids: ['baz', 'bar'],
            });
        });
        it('multi (with priority)', ()=>{
            addVote(box, {
                from: 'id1',
                to: 'baz',
                num: 1,
                priority: 2,
            });
            addVote(box, {
                from: 'id2',
                to: 'baz',
                num: 2,
                priority: 1,
            });
            addVote(box, {
                from: 'id3',
                to: 'bar',
                num: 1,
                priority: 0,
            });
            addVote(box, {
                from: 'id4',
                to: 'bar',
                num: 2,
                priority: 2,
            });
            expect(countVotes(box)).toEqual({
                result: VOTERESULT_MULTI,
                ids: ['baz', 'bar'],
            });
        });
    });
});
