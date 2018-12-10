require('module-alias/register');
require('mocha');

const { expect } = require('chai');

const util = require('@prism/utils');

describe('util', () => {
    describe('parseContextString', () => {
        it('should correctly parse single context name', () => {
            const input = 'ali';
            const expected = [
                {
                    name: 'ali',
                    sub: []
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse single context name with subcontexts', () => {
            const input = 'ali(veli)';
            const expected = [
                {
                    name: 'ali',
                    sub: [ 'veli' ]
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse single context name with subcontexts with adjacent whitespaces', () => {
            const input = 'ali  (  veli ) ';
            const expected = [
                {
                    name: 'ali',
                    sub: [ 'veli' ]
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse multiple context names', () => {
            const input = 'ali, veli';
            const expected = [
                {
                    name: 'ali',
                    sub: []
                },
                {
                    name: 'veli',
                    sub: []
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse multiple context names without duplicates', () => {
            const input = 'ali, veli, ali';
            const expected = [
                {
                    name: 'ali',
                    sub: []
                },
                {
                    name: 'veli',
                    sub: []
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse multiple context names where some of them have sub contexts', () => {
            const input = 'ali, veli, zilli(deli)';
            const expected = [
                {
                    name: 'ali',
                    sub: []
                },
                {
                    name: 'veli',
                    sub: []
                },
                {
                    name: 'zilli',
                    sub: [ 'deli' ]
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should correctly parse multiple context names where some of them have sub contexts with adjacent whitespaces', () => {
            const input = 'ali, veli, zilli  ( deli ), keke';
            const expected = [
                {
                    name: 'ali',
                    sub: []
                },
                {
                    name: 'veli',
                    sub: []
                },
                {
                    name: 'zilli',
                    sub: [ 'deli' ]
                },
                {
                    name: 'keke',
                    sub: []
                }
            ];

            const actual = util.parseContextString(input);

            expect(actual).to.deep.equal(expected);
        });
    })
})
